# ⏏ Exodus

> Eject from SaaS. An AI agent that matches open-source alternatives to the tools you pay for — and deploys them to your cloud in 2 minutes.

[![Live](https://img.shields.io/badge/live-exodus.stack.lol-blue)](https://exodus.stack.lol)
[![Built at](https://img.shields.io/badge/built%20at-SuperAI%20NEXT%20'26-orange)](https://superai.com)

---

## What it does

Type the SaaS tools your team pays for. Exodus matches each one to the best open-source alternative from a catalog of 200+ Docker-ready packages — you approve every choice — then deploys your entire stack to AWS with one click.

**Input →** _"We use Notion, Slack, and Jira"_
**Output →** Outline, Mattermost, and Plane — live at `*.stack.lol` in under two minutes.

## How it works

```
Name the SaaS you pay for
        ↓
Agent picks the best open-source replacement (you approve or override)
        ↓
One click → deployed to AWS with HTTPS
        ↓
*.stack.lol — preview it right from Exodus
```

| Step | What happens | Tech |
|------|-------------|------|
| **Parse** | Recognizes SaaS tools from free-text input | Stack catalog (200+ products) |
| **Match** | Ranks open-source alternatives by GitHub stars | Auto-select or human-in-the-loop |
| **Deploy** | Provisions containers, routing, and TLS | AWS ECS Fargate · ALB · Cloudflare |

## Features

- **200+ alternatives** — curated SaaS → OSS mappings, ranked by community traction
- **You stay in control** — auto-selects clear winners, asks you on close calls
- **Live in two minutes** — one-click deploy to AWS ECS Fargate with HTTPS subdomains
- **Works offline too** — download `compose.yaml` + `.env` and `docker compose up`
- **Preview before you commit** — open deployed services directly inside Exodus
- **Your data, your rules** — self-hosted, no vendor lock-in, no surprise bills

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | KISS: React 19 SPA · [PerformativeUI](https://github.com/vorpus/performativeUI) · Tailwind CSS |
| Hosting | Vercel + GitHub Pages |
| Backend | AWS Lambda (Node.js 22) · API Gateway HTTP API |
| Compute | AWS ECS Fargate |
| Routing | ALB (host-based rules) · Cloudflare (wildcard HTTPS `*.stack.lol`) |
| Data | [stack.lol](https://stack.lol) catalog API |

## Project structure

```
src/front/      → Frontend SPA (single index.html)
src/aws/        → Lambda handler + infrastructure scripts
docs/           → Project docs, design notes
.github/        → CI/CD (Vercel + GitHub Pages)
```

## Development

The frontend is a single HTML file with inline React — no build step.

```bash
# Serve locally
cd src/front && python3 -m http.server 8000

# Update Lambda
cd src/aws && ./update-lambda.sh

# Provision infrastructure (idempotent)
cd src/aws && ./setup.sh
```

## License

Built solo at [SuperAI NEXT Hackathon '26](https://superai.com), Singapore.
