#!/usr/bin/env bash
set -euo pipefail

REGION="${AWS_DEFAULT_REGION:-us-west-2}"
CLUSTER="exodus"
LAMBDA_NAME="exodus-deploy"
API_NAME="exodus-api"
DOMAIN="stack.lol"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=== Exodus AWS Setup ==="
echo "Region: $REGION"

ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text)
echo "Account: $ACCOUNT_ID"

# 1. Default VPC
echo -e "\n[1/8] Getting default VPC..."
VPC_ID=$(aws ec2 describe-vpcs --filters "Name=is-default,Values=true" \
  --query "Vpcs[0].VpcId" --output text --region "$REGION")
[ "$VPC_ID" != "None" ] && [ -n "$VPC_ID" ] || { echo "ERROR: No default VPC"; exit 1; }
echo "VPC: $VPC_ID"

# 2. Subnets
echo -e "\n[2/8] Getting subnets..."
SUBNETS=$(aws ec2 describe-subnets \
  --filters "Name=vpc-id,Values=$VPC_ID" "Name=default-for-az,Values=true" \
  --query "Subnets[*].SubnetId" --output text --region "$REGION" | tr '\t' ',')
echo "Subnets: $SUBNETS"

# 3. Security Groups
echo -e "\n[3/8] Security groups..."

# ECS task SG
SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=exodus-tasks" "Name=vpc-id,Values=$VPC_ID" \
  --query "SecurityGroups[0].GroupId" --output text --region "$REGION" 2>/dev/null || echo "None")
if [ "$SG_ID" = "None" ] || [ -z "$SG_ID" ]; then
  SG_ID=$(aws ec2 create-security-group \
    --group-name exodus-tasks --description "Exodus ECS tasks" \
    --vpc-id "$VPC_ID" --query "GroupId" --output text --region "$REGION")
  aws ec2 authorize-security-group-ingress --group-id "$SG_ID" \
    --ip-permissions IpProtocol=tcp,FromPort=0,ToPort=65535,IpRanges='[{CidrIp=0.0.0.0/0}]' \
    --region "$REGION"
  echo "Created task SG: $SG_ID"
else
  echo "Existing task SG: $SG_ID"
fi

# ALB SG
ALB_SG_ID=$(aws ec2 describe-security-groups \
  --filters "Name=group-name,Values=exodus-alb" "Name=vpc-id,Values=$VPC_ID" \
  --query "SecurityGroups[0].GroupId" --output text --region "$REGION" 2>/dev/null || echo "None")
if [ "$ALB_SG_ID" = "None" ] || [ -z "$ALB_SG_ID" ]; then
  ALB_SG_ID=$(aws ec2 create-security-group \
    --group-name exodus-alb --description "Exodus ALB" \
    --vpc-id "$VPC_ID" --query "GroupId" --output text --region "$REGION")
  aws ec2 authorize-security-group-ingress --group-id "$ALB_SG_ID" \
    --ip-permissions IpProtocol=tcp,FromPort=80,ToPort=80,IpRanges='[{CidrIp=0.0.0.0/0}]' \
    --region "$REGION"
  aws ec2 authorize-security-group-ingress --group-id "$ALB_SG_ID" \
    --ip-permissions IpProtocol=tcp,FromPort=443,ToPort=443,IpRanges='[{CidrIp=0.0.0.0/0}]' \
    --region "$REGION"
  echo "Created ALB SG: $ALB_SG_ID"
else
  echo "Existing ALB SG: $ALB_SG_ID"
fi

# 4. ECS Cluster
echo -e "\n[4/8] ECS cluster..."
aws ecs create-cluster --cluster-name "$CLUSTER" --region "$REGION" \
  --output text --query "cluster.clusterArn" 2>/dev/null || echo "Cluster exists"

# 5. Application Load Balancer
echo -e "\n[5/8] Application Load Balancer..."
ALB_ARN=$(aws elbv2 describe-load-balancers --names exodus-alb --region "$REGION" \
  --query "LoadBalancers[0].LoadBalancerArn" --output text 2>/dev/null || echo "None")

if [ "$ALB_ARN" = "None" ] || [ -z "$ALB_ARN" ]; then
  SUBNET_ARGS=$(echo "$SUBNETS" | tr ',' ' ')
  ALB_ARN=$(aws elbv2 create-load-balancer \
    --name exodus-alb --type application --scheme internet-facing \
    --subnets $SUBNET_ARGS --security-groups "$ALB_SG_ID" \
    --query "LoadBalancers[0].LoadBalancerArn" --output text --region "$REGION")
  echo "Created ALB, waiting for it to become active..."
  aws elbv2 wait load-balancer-available --load-balancer-arns "$ALB_ARN" --region "$REGION"
  echo "ALB active"
else
  echo "Existing ALB: $ALB_ARN"
fi

ALB_DNS=$(aws elbv2 describe-load-balancers --load-balancer-arns "$ALB_ARN" --region "$REGION" \
  --query "LoadBalancers[0].DNSName" --output text)
echo "ALB DNS: $ALB_DNS"

# HTTP listener (default: 404)
LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn "$ALB_ARN" --region "$REGION" \
  --query "Listeners[?Port==\`80\`].ListenerArn | [0]" --output text 2>/dev/null || echo "None")

if [ "$LISTENER_ARN" = "None" ] || [ -z "$LISTENER_ARN" ]; then
  LISTENER_ARN=$(aws elbv2 create-listener \
    --load-balancer-arn "$ALB_ARN" --port 80 --protocol HTTP \
    --default-actions 'Type=fixed-response,FixedResponseConfig={StatusCode=404,ContentType=text/plain,MessageBody=Not found}' \
    --query "Listeners[0].ListenerArn" --output text --region "$REGION")
  echo "Created listener: $LISTENER_ARN"
else
  echo "Existing listener: $LISTENER_ARN"
fi

# 6. IAM Roles
echo -e "\n[6/8] IAM roles..."
EXEC_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/exodus-task-execution"
LAMBDA_ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/exodus-lambda"

aws iam create-role --role-name exodus-task-execution \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
  --output text --query "Role.Arn" 2>/dev/null || echo "  task-execution role exists"
aws iam attach-role-policy --role-name exodus-task-execution \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy 2>/dev/null || true
aws iam attach-role-policy --role-name exodus-task-execution \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchLogsFullAccess 2>/dev/null || true

aws iam create-role --role-name exodus-lambda \
  --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"lambda.amazonaws.com"},"Action":"sts:AssumeRole"}]}' \
  --output text --query "Role.Arn" 2>/dev/null || echo "  lambda role exists"
aws iam attach-role-policy --role-name exodus-lambda \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole 2>/dev/null || true
aws iam attach-role-policy --role-name exodus-lambda \
  --policy-arn arn:aws:iam::aws:policy/AmazonECS_FullAccess 2>/dev/null || true
aws iam attach-role-policy --role-name exodus-lambda \
  --policy-arn arn:aws:iam::aws:policy/AmazonEC2ReadOnlyAccess 2>/dev/null || true
aws iam attach-role-policy --role-name exodus-lambda \
  --policy-arn arn:aws:iam::aws:policy/ElasticLoadBalancingFullAccess 2>/dev/null || true

echo "Waiting 10s for IAM propagation..."
sleep 10

# 7. Lambda Function
echo -e "\n[7/8] Lambda function..."
cd "$SCRIPT_DIR/lambda"
zip -qr /tmp/exodus-lambda.zip .
cd "$SCRIPT_DIR"

ENV_JSON="{\"Variables\":{\"ECS_CLUSTER\":\"$CLUSTER\",\"SUBNETS\":\"$SUBNETS\",\"SECURITY_GROUP\":\"$SG_ID\",\"EXECUTION_ROLE_ARN\":\"$EXEC_ROLE_ARN\",\"LISTENER_ARN\":\"$LISTENER_ARN\",\"VPC_ID\":\"$VPC_ID\",\"DOMAIN\":\"$DOMAIN\"}}"

if aws lambda get-function --function-name "$LAMBDA_NAME" --region "$REGION" >/dev/null 2>&1; then
  aws lambda update-function-code \
    --function-name "$LAMBDA_NAME" \
    --zip-file fileb:///tmp/exodus-lambda.zip \
    --region "$REGION" --output text --query "FunctionArn"
  aws lambda wait function-updated-v2 --function-name "$LAMBDA_NAME" --region "$REGION"
  aws lambda update-function-configuration \
    --function-name "$LAMBDA_NAME" --timeout 120 \
    --environment "$ENV_JSON" \
    --region "$REGION" --output text --query "FunctionArn"
  echo "Updated Lambda"
else
  aws lambda create-function \
    --function-name "$LAMBDA_NAME" \
    --runtime nodejs22.x \
    --handler index.handler \
    --role "$LAMBDA_ROLE_ARN" \
    --zip-file fileb:///tmp/exodus-lambda.zip \
    --timeout 120 \
    --environment "$ENV_JSON" \
    --region "$REGION" --output text --query "FunctionArn"
  echo "Created Lambda"
fi

aws lambda wait function-active-v2 --function-name "$LAMBDA_NAME" --region "$REGION"

# 8. API Gateway
echo -e "\n[8/8] API Gateway..."
API_ID=$(aws apigatewayv2 get-apis --region "$REGION" \
  --query "Items[?Name=='$API_NAME'].ApiId | [0]" --output text 2>/dev/null || echo "None")

if [ "$API_ID" = "None" ] || [ -z "$API_ID" ]; then
  API_ID=$(aws apigatewayv2 create-api \
    --name "$API_NAME" --protocol-type HTTP \
    --cors-configuration 'AllowOrigins=*,AllowMethods=GET,POST,OPTIONS,AllowHeaders=Content-Type' \
    --query "ApiId" --output text --region "$REGION")
  echo "Created API: $API_ID"
else
  echo "Existing API: $API_ID"
fi

LAMBDA_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${LAMBDA_NAME}"

INTEGRATION_ID=$(aws apigatewayv2 get-integrations --api-id "$API_ID" --region "$REGION" \
  --query "Items[?IntegrationUri=='$LAMBDA_ARN'].IntegrationId | [0]" --output text 2>/dev/null || echo "None")

if [ "$INTEGRATION_ID" = "None" ] || [ -z "$INTEGRATION_ID" ]; then
  INTEGRATION_ID=$(aws apigatewayv2 create-integration \
    --api-id "$API_ID" --integration-type AWS_PROXY \
    --integration-uri "$LAMBDA_ARN" --payload-format-version 2.0 \
    --query "IntegrationId" --output text --region "$REGION")
fi

for ROUTE in "POST /deploy" "GET /status"; do
  aws apigatewayv2 create-route --api-id "$API_ID" \
    --route-key "$ROUTE" --target "integrations/$INTEGRATION_ID" \
    --region "$REGION" 2>/dev/null || true
done

aws apigatewayv2 create-stage --api-id "$API_ID" \
  --stage-name '$default' --auto-deploy \
  --region "$REGION" 2>/dev/null || true

aws lambda add-permission --function-name "$LAMBDA_NAME" \
  --statement-id "apigateway-${API_ID}" \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*" \
  --region "$REGION" 2>/dev/null || true

API_URL="https://${API_ID}.execute-api.${REGION}.amazonaws.com"

cat > "$SCRIPT_DIR/config.env" <<EOF
API_URL=$API_URL
API_ID=$API_ID
ECS_CLUSTER=$CLUSTER
VPC_ID=$VPC_ID
SUBNETS=$SUBNETS
SECURITY_GROUP=$SG_ID
ALB_SG_ID=$ALB_SG_ID
ALB_ARN=$ALB_ARN
ALB_DNS=$ALB_DNS
LISTENER_ARN=$LISTENER_ARN
EXECUTION_ROLE_ARN=$EXEC_ROLE_ARN
LAMBDA_ROLE_ARN=$LAMBDA_ROLE_ARN
ACCOUNT_ID=$ACCOUNT_ID
REGION=$REGION
DOMAIN=$DOMAIN
EOF

rm -f /tmp/exodus-lambda.zip

echo ""
echo "============================================"
echo "✅ Exodus platform deployed!"
echo ""
echo "API:      $API_URL"
echo "ALB DNS:  $ALB_DNS"
echo ""
echo "⚠️  Cloudflare: create a proxied CNAME record:"
echo "   *.${DOMAIN}  →  ${ALB_DNS}"
echo ""
echo "Then test:"
echo "  curl -s -X POST $API_URL/deploy \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"stacks\":[{\"name\":\"gatus\",\"image\":\"twinproduction/gatus:latest\",\"port\":8080}]}' | jq"
echo ""
echo "  curl -s $API_URL/status | jq"
echo "  # → https://gatus.${DOMAIN}"
echo "============================================"
