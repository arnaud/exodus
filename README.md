# ⏏ Exodus

> Eject from SaaS. An AI agent that matches open-source alternatives to the tools you pay for — and deploys them to your cloud in 2 minutes.

[![Live](https://img.shields.io/badge/live-exodus.stack.lol-blue)](https://exodus.stack.lol)
[![Built at](https://img.shields.io/badge/built%20at-SuperAI%20NEXT%20'26-orange)](https://superai.com)
[![AGENTS.md](https://img.shields.io/badge/AGENTS.md-→%20agent%20docs-8A2BE2)](./AGENTS.md)

---

## What it does

Type the SaaS tools your team pays for — or open-source tools you already use. Exodus matches each SaaS to the best open-source alternative from a catalog of 200+ Docker-ready packages — you approve every choice — then deploys your entire stack to AWS with one click.

**Input →** _"We use Notion, GitLab, and Datadog"_
**Output →** GitLab is already open-source ✓ — Outline and SigNoz deployed live at `*.stack.lol` for $1/stack (5h sandbox).

## How it works

```
Name the tools you use (SaaS or open-source)
        ↓
Agent recognizes both — SaaS get replaced, OSS get a ✓
        ↓
You approve every choice
        ↓
$1/stack → deployed to AWS with HTTPS (5h sandbox)
        ↓
*.stack.lol — preview it right from Exodus
```

| Step | What happens | Tech |
|------|-------------|------|
| **Parse** | Recognizes SaaS and open-source tools from free-text | Stack catalog (200+ SaaS, 200+ OSS) |
| **Match** | Ranks open-source alternatives by GitHub stars; flags tools already OSS | Auto-select or human-in-the-loop |
| **Pay** | $1/stack via Stripe Payment Link (popup, no redirect) | Stripe Payment Links |
| **Deploy** | Provisions containers, routing, and TLS (5h sandbox) | AWS ECS Fargate · ALB · Cloudflare |

## Features

- **200+ alternatives** — curated SaaS → OSS mappings, ranked by community traction
- **Detects open-source too** — already using GitLab or Grafana? The agent recognizes it and skips replacement
- **You stay in control** — auto-selects clear winners, asks you on close calls
- **$1 sandbox** — deploy to AWS for $1/stack with a 5-hour live preview
- **Live in two minutes** — one-click deploy to AWS ECS Fargate with HTTPS subdomains
- **Works offline too** — download `compose.yaml` + `.env` and `docker compose up`
- **Preview before you commit** — open deployed services directly inside Exodus
- **Your data, your rules** — self-hosted, no vendor lock-in, no surprise bills

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | KISS: React 19 SPA · [PerformativeUI](https://github.com/vorpus/performativeUI) · Tailwind CSS |
| Payments | Stripe Payment Links ($1/stack, 5h sandbox) |
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
