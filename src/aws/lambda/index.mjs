import { randomBytes } from "node:crypto";
import {
  ECSClient, RegisterTaskDefinitionCommand, CreateServiceCommand,
  DescribeServicesCommand, ListServicesCommand,
} from "@aws-sdk/client-ecs";
import {
  ElasticLoadBalancingV2Client, CreateTargetGroupCommand,
  CreateRuleCommand,
} from "@aws-sdk/client-elastic-load-balancing-v2";

const ecs = new ECSClient({});
const elbv2 = new ElasticLoadBalancingV2Client({});

const {
  ECS_CLUSTER: CLUSTER,
  SUBNETS: SUBNETS_STR,
  SECURITY_GROUP,
  EXECUTION_ROLE_ARN,
  LISTENER_ARN,
  VPC_ID,
  DOMAIN = "stack.lol",
} = process.env;
const SUBNETS = SUBNETS_STR?.split(",") || [];

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};
const respond = (statusCode, body) => ({ statusCode, headers, body: JSON.stringify(body) });

// --- Naming ---

// DNS-safe: lowercase, alphanumeric + hyphens, no leading/trailing hyphens
function sanitize(raw) {
  return raw.toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 22);
}

// 6 hex chars → ~16M combinations
function generateId() {
  return randomBytes(3).toString("hex");
}

// {sanitized-name}-{random}.stack.lol
function makeSlug(name) {
  return `${sanitize(name)}-${generateId()}`;
}

// Deterministic ALB rule priority from slug (1–49000)
function hashPriority(slug) {
  let h = 0;
  for (const c of slug) h = ((h << 5) - h + c.charCodeAt(0)) | 0;
  return (Math.abs(h) % 49000) + 1;
}

// --- Validation ---

function validate(s) {
  const err = [];
  if (!s.name || typeof s.name !== "string")
    return ["name is required"];
  if (!/^[a-zA-Z][a-zA-Z0-9-]*$/.test(s.name))
    return ["name must start with a letter, then only letters, numbers, and hyphens"];
  if (s.name.length > 30)
    return ["name must be 30 characters or fewer"];
  if (s.name !== s.name.toLowerCase())
    err.push("name must be lowercase");
  if (!s.image || typeof s.image !== "string")
    err.push("image is required (e.g. 'nginx:latest')");
  if (s.port !== undefined) {
    const p = Number(s.port);
    if (!Number.isInteger(p) || p < 1 || p > 65535)
      err.push("port must be an integer 1–65535");
  }
  return err;
}

// --- Routes ---

export const handler = async (event) => {
  const { method } = event.requestContext?.http || {};
  const path = event.rawPath;

  if (method === "OPTIONS") return { statusCode: 204, headers };

  try {
    if (method === "POST" && path === "/deploy") return await deploy(JSON.parse(event.body));
    if (method === "GET" && path === "/status") return await status();
    return respond(404, { error: "Not found" });
  } catch (e) {
    console.error(e);
    return respond(500, { error: e.message });
  }
};

// --- POST /deploy ---

async function deploy({ stacks }) {
  if (!Array.isArray(stacks) || !stacks.length)
    return respond(400, { error: "stacks[] is required" });

  // Validate all before deploying any
  for (const s of stacks) {
    const errs = validate(s);
    if (errs.length)
      return respond(422, { error: `Invalid stack "${s.name || "(unnamed)"}": ${errs.join("; ")}` });
  }

  const results = [];
  for (const s of stacks) {
    const slug = makeSlug(s.name);
    const res = `ex-${slug}`; // ≤31 chars, fits TG 32-char limit
    const port = s.port || 80;
    const hostname = `${slug}.${DOMAIN}`;

    // 1. Task definition
    const td = await ecs.send(new RegisterTaskDefinitionCommand({
      family: res,
      networkMode: "awsvpc",
      requiresCompatibilities: ["FARGATE"],
      cpu: String(s.cpu || 256),
      memory: String(s.memory || 512),
      executionRoleArn: EXECUTION_ROLE_ARN,
      containerDefinitions: [{
        name: slug,
        image: s.image,
        essential: true,
        portMappings: [{ containerPort: port, protocol: "tcp" }],
        environment: Object.entries(s.environment || {}).map(
          ([k, v]) => ({ name: k, value: String(v) })
        ),
        logConfiguration: {
          logDriver: "awslogs",
          options: {
            "awslogs-group": `/ecs/${res}`,
            "awslogs-region": process.env.AWS_REGION || "us-west-2",
            "awslogs-stream-prefix": "ecs",
            "awslogs-create-group": "true",
          },
        },
      }],
    }));

    // 2. ALB target group
    const tg = await elbv2.send(new CreateTargetGroupCommand({
      Name: res,
      Protocol: "HTTP",
      Port: port,
      VpcId: VPC_ID,
      TargetType: "ip",
      HealthCheckPath: s.healthCheck || "/",
      HealthCheckProtocol: "HTTP",
      HealthyThresholdCount: 2,
      UnhealthyThresholdCount: 3,
      HealthCheckTimeoutSeconds: 10,
      HealthCheckIntervalSeconds: 30,
      Matcher: { HttpCode: "200-499" },
    }));
    const tgArn = tg.TargetGroups[0].TargetGroupArn;

    // 3. ALB listener rule (retry on priority collision)
    let placed = false;
    let priority = hashPriority(slug);
    for (let i = 0; i < 20 && !placed; i++) {
      try {
        await elbv2.send(new CreateRuleCommand({
          ListenerArn: LISTENER_ARN,
          Conditions: [{ Field: "host-header", Values: [hostname] }],
          Actions: [{ Type: "forward", TargetGroupArn: tgArn }],
          Priority: priority + i,
        }));
        placed = true;
      } catch (e) {
        if (!e.name?.includes("PriorityInUse")) throw e;
      }
    }
    if (!placed) throw new Error(`No available listener rule priority for ${slug}`);

    // 4. ECS service (registered with ALB)
    await ecs.send(new CreateServiceCommand({
      cluster: CLUSTER,
      serviceName: res,
      taskDefinition: td.taskDefinition.taskDefinitionArn,
      desiredCount: 1,
      launchType: "FARGATE",
      networkConfiguration: {
        awsvpcConfiguration: {
          subnets: SUBNETS,
          securityGroups: [SECURITY_GROUP],
          assignPublicIp: "ENABLED",
        },
      },
      loadBalancers: [{
        targetGroupArn: tgArn,
        containerName: slug,
        containerPort: port,
      }],
      healthCheckGracePeriodSeconds: 120,
    }));

    results.push({ name: s.name, slug, url: `https://${hostname}`, status: "DEPLOYING" });
  }

  return respond(200, { deployments: results });
}

// --- GET /status ---

async function status() {
  const listed = await ecs.send(new ListServicesCommand({ cluster: CLUSTER }));
  if (!listed.serviceArns?.length) return respond(200, { services: [] });

  const described = await ecs.send(new DescribeServicesCommand({
    cluster: CLUSTER, services: listed.serviceArns,
  }));

  const services = described.services.map(svc => {
    const slug = svc.serviceName.replace(/^ex-/, "");
    return {
      slug,
      url: `https://${slug}.${DOMAIN}`,
      status: svc.status,
      desired: svc.desiredCount,
      running: svc.runningCount,
      pending: svc.pendingCount,
      healthy: svc.runningCount >= svc.desiredCount && svc.desiredCount > 0,
    };
  });

  return respond(200, { services });
}
