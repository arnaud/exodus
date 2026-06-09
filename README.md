# ⏏ Exodus

> Eject from SaaS. An AI agent that finds open-source alternatives and deploys your self-hosted stack in 2′.

[![Deploy](https://img.shields.io/badge/live-exodus.stack.lol-blue)](https://exodus.stack.lol)

---

## What it does

Tell Exodus which SaaS tools you pay for. It matches each one to the best open-source alternative from a catalog of 200+ Docker-ready packages, then deploys the whole stack to AWS with a single click.

**Input →** _"We use Notion, Slack, and Jira"_
**Output →** Self-hosted Outline, Mattermost, and Plane — live at `*.stack.lol` in under two minutes.

## How it works

```
You type what you pay for
        ↓
Agent matches open-source alternatives (you approve every choice)
        ↓
One click → AWS ECS Fargate + ALB + Cloudflare HTTPS
        ↓
*.stack.lol — your stack is live
```

| Step | What happens | Tech |
|------|-------------|------|
| **Parse** | Identifies SaaS tools from free-text input | Stack catalog API |
| **Match** | Finds the top-rated OSS replacement per tool | GitHub stars ranking |
| **Deploy** | Provisions containers, routing, and TLS | AWS ECS Fargate, ALB, Cloudflare DNS |

## Features

- **Smart matching** — 200+ SaaS → OSS mappings, ranked by GitHub stars
- **Human-in-the-loop** — auto-selects clear winners, asks you on close calls
- **One-click cloud deploy** — AWS ECS Fargate with HTTPS subdomains on `stack.lol`
- **Docker Compose export** — download `compose.yaml` + `.env` and run locally
- **Live preview** — open deployed services directly from the UI
- **Data sovereignty** — your tools, your infrastructure, no vendor lock-in

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 SPA · [PerformativeUI](https://github.com/vorpus/performativeUI) · Tailwind CSS |
| Hosting | GitHub Pages |
| Backend | AWS Lambda (Node.js 22) · API Gateway HTTP API |
| Compute | AWS ECS Fargate |
| Routing | ALB (host-based rules) · Cloudflare DNS (wildcard `*.stack.lol`) |
| Data | [stack.lol](https://stack.lol) catalog API |

## Project structure

```
src/            → Frontend SPA (single index.html)
work/aws/       → Lambda handler + infrastructure scripts
docs/           → Project docs, design notes
.github/        → CI/CD (GitHub Pages deploy)
```

## Development

The frontend is a single HTML file with inline React — no build step.

```bash
# Serve locally
cd src && python3 -m http.server 8000

# Update Lambda
cd work/aws && ./update-lambda.sh

# Provision infrastructure (idempotent)
cd work/aws && ./setup.sh
```

## License

Built at [SuperAI NEXT Hackathon '26](https://superai.com), Singapore.
