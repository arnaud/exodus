# AGENTS.md

## Project

**Exodus** — "Eject from SaaS." An agentic pipeline that matches open-source alternatives to paid SaaS tools and deploys them as self-hosted stacks. Built solo at SuperAI NEXT Hackathon '26 (Singapore, 36h).

Live: [exodus.stack.lol](https://exodus.stack.lol)

---

## Architecture

```
Browser (static frontend on Vercel)
  ├── Agent loop (deterministic, no LLM by default)
  │   ├── 🔍 Scout        — identify tools (whole-word match → AI escalation)
  │   ├── 📚 Matchmaker    — rank OSS alternatives (auto-select vs HITL)
  │   └── ☁️ Deployer      — compose → images → ECS Fargate
  ├── Exa API              — web search for candidate research (browser-direct)
  ├── Stripe Payment Link  — $1/stack popup checkout (no backend)
  └── stack.lol catalog    — compose.yaml + .env from GitHub raw
         │
         │ fetch (CORS)
         ▼
AWS (us-west-2)
  ├── API Gateway HTTP API     POST /deploy · GET /status · POST /ai/chat
  ├── Lambda (Node.js 22)      control plane + AI proxy
  ├── ECS Fargate              one service per stack
  ├── ALB                      host-based routing → *.stack.lol
  ├── EventBridge              rate(15 min) teardown sweep
  └── Cloudflare               wildcard HTTPS termination
```

The agent loop runs **entirely in the browser** — no backend for the core flow. The Lambda serves cloud deploys and proxies LLM calls through the Vercel AI Gateway (key stays server-side).

---

## File Structure

```
src/
├── front/
│   ├── index.html          ← entry point: head, SEO/CSP meta, import map, script tags
│   ├── app.tsx             ← THE app. React 19 SPA, transpiled in-browser by Babel
│   ├── locales.json        ← non-English i18n catalog (fetched by app.tsx before mount)
│   └── stacks.json         ← cached catalog (fetched at build, empty = fetch at runtime)
├── aws/
│   ├── lambda/
│   │   └── index.mjs       ← Lambda: deploy, status, teardown, AI proxy
│   ├── setup.sh            ← one-shot AWS infra provisioning
│   ├── teardown.sh         ← tear down all AWS resources
│   ├── update-lambda.sh    ← redeploy Lambda code
│   ├── config.env.sample   ← required AWS env vars template
│   └── config.env          ← (gitignored) actual AWS config
└── CNAME                   ← exodus.stack.lol

docs/
├── architecture.svg        ← system diagram (sponsor-aware)
└── PerformativeUI.md       ← UI component library docs

.github/workflows/
├── deploy-vercel.yml       ← push to main → Vercel production deploy
└── deploy.yml              ← push to main → GitHub Pages deploy
```

### The Buildless Frontend

The frontend is three static files — **no build step, no bundler**:

- `index.html` — head (SEO, CSP, import map, styles) + script tags, nothing else
- `app.tsx` — the entire application: components, agent logic, English i18n strings (the fallback locale), tool definitions, state machine. Loaded via `<script type="text/babel" src="app.tsx">` and transpiled in-browser by Babel Standalone
- `locales.json` — the 21 non-English locales, pure data; app.tsx fetches and merges it into `I18N` before mounting

Shared plumbing:

- **React 19 + ReactDOM** via `esm.sh` import maps
- **Babel Standalone** for in-browser TypeScript + JSX transpilation
- **Tailwind CSS v4** via CDN
- **PerformativeUI** components (chat bubbles, tool traces, status dots, etc.)
- **CSP header** locks down network access to known origins

---

## Key Concepts

### The Agent Loop

Three agents in a sequential pipeline with gates:

| Agent | What it does | Decision rule |
|-------|-------------|---------------|
| **Scout** | Parses free-text → identifies SaaS & OSS tools against the catalog (~148 SaaS, ~201 OSS) | Fast catalog match first; when that's not enough, asks the AI Gateway to interpret the input (e.g. *"a tool that tracks bugs"* → Jira) |
| **Matchmaker** | For each SaaS tool, looks up OSS alternatives ranked by GitHub ★ | ≤1 candidate with 5000+ stars → auto-select · >1 strong → HITL (user picks) |
| **Deployer** | Fetches compose files, parses images/ports, provisions on AWS | Gated by Stripe payment ($1/stack, 5h sandbox) |

The pipeline is **deterministic-first** — catalog lookup and star ranking handle the common cases instantly — but the Vercel AI Gateway (Claude Haiku 4.5 via Lambda proxy) kicks in whenever the simple detector isn't enough: fuzzy descriptions, misspellings, or tools described by function rather than name.

### Human-in-the-Loop (HITL)

When the Matchmaker finds multiple strong candidates (>1 with 5000+ GitHub stars), the agent **pauses** and presents options to the user. The user can:
- Select an alternative
- Click "Search the web" to run an Exa search for reviews/docs
- See star counts, license, and description

Once all HITL gates resolve, the agent **resumes autonomously**.

### Deployment Lifecycle

1. User clicks "Deploy to cloud" → Stripe Payment Link opens in popup
2. Payment completes → popup closes → agent parses compose YAML → extracts images + ports
3. `POST /deploy` → Lambda provisions ECS Fargate task + ALB target group + listener rule
4. Agent polls `GET /status` until services are healthy
5. Services live at `{slug}.stack.lol` with 5h TTL
6. EventBridge sweeps expired sandboxes every 15 minutes

### Subdomain Naming

```
{sanitized-name}-{6-hex-chars}.stack.lol
```
Lowercase, alphanumeric + hyphens, max 30 chars, random suffix for multi-tenant uniqueness.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Static HTML + in-browser TSX · React 19 · ReactDOM (esm.sh CDN) |
| Transpilation | Babel Standalone (in-browser TSX) |
| Styling | Tailwind CSS v4 (CDN) |
| UI Components | [PerformativeUI](https://github.com/vorpus/performativeUI) |
| Hosting | Vercel (primary) · GitHub Pages (fallback) |
| Catalog | stack.lol REST API + GitHub raw content |
| Agent engine | Deterministic tool-use loop · no LLM default path |
| AI matching | Vercel AI Gateway → Claude Haiku 4.5 (proxied via Lambda) |
| Web search | Exa API (browser-direct) |
| Payments | Stripe Payment Links (popup checkout) |
| Backend | AWS Lambda (Node.js 22) + API Gateway HTTP API |
| Compute | AWS ECS Fargate |
| Routing | ALB (host-based) + Cloudflare (wildcard HTTPS) |
| Teardown | EventBridge scheduled rule → Lambda |

---

## Development

### Run locally

The frontend is plain static files — just serve them:

```bash
# Any static server works
cd src/front
python3 -m http.server 8000
# or
npx serve .
```

No `npm install`. No build. The import map resolves all dependencies from `esm.sh` at runtime.

### Deploy frontend

Push to `main` → both GitHub Actions workflows trigger:
- `deploy-vercel.yml` — deploys `src/front/` to Vercel production
- `deploy.yml` — deploys `src/front/` to GitHub Pages

### Update Lambda

```bash
cd src/aws
./update-lambda.sh
```

### AWS infrastructure (one-shot)

```bash
cd src/aws
cp config.env.sample config.env   # fill in values
./setup.sh                         # provisions VPC, SG, ECS, ALB, Lambda, API GW, EventBridge
```

---

## Important Constraints

1. **Buildless architecture** — The frontend is three static files: `index.html` (entry/head), `app.tsx` (all application code), `locales.json` (non-English strings, data only). No bundler, no node_modules, no build step — Babel Standalone transpiles `app.tsx` in the browser. Keep all application logic in `app.tsx`; don't add more script files (Babel `text/babel` scripts can't import each other as ES modules).

2. **Deterministic-first, AI-assisted** — The core loop uses catalog lookup + star thresholds for speed and reliability. The Vercel AI Gateway (proxied through Lambda at `POST /ai/chat`) fills the gaps — fuzzy input, descriptions-by-function, misspellings. Both paths are load-bearing; don't remove either.

3. **CSP lockdown** — The `Content-Security-Policy` meta tag restricts all network access. If you add a new external API, you must add its origin to the CSP `connect-src` directive.

4. **Browser-only agent loop** — The conversation state machine (`idle → analyzing → hitl → fetching → done`) runs entirely client-side. The Lambda is only called for deploy/status/teardown and AI proxy.

5. **i18n** — All user-facing strings go through the `I18N` object (22 languages). The `en` locale lives in `app.tsx` (source of truth and fallback if `locales.json` fails to load); the other 21 live in `locales.json`, fetched and merged before mount. New text must be added to all language keys.

6. **5-hour sandbox TTL** — Deployed services are tagged with `exodus:expiresAt` and automatically torn down by EventBridge. This is intentional — it bounds infrastructure cost and creates an upgrade path.

7. **No secrets in the frontend** — The Vercel AI Gateway key and AWS credentials live in the Lambda environment. The frontend proxies AI calls through `POST /ai/chat`. The Exa API key is prompted from the user at runtime.

8. **Catalog dependency** — The app depends on the [stack.lol](https://stack.lol) catalog API (`/api/stacks`) and GitHub raw content for compose files. If the catalog is down, the tool-matching flow degrades gracefully.

---

## Lambda API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/deploy` | POST | Provision ECS task def + ALB target group + listener rule + ECS service |
| `/status` | GET | Return service health + live URLs for a deployment |
| `/teardown` | POST | Reap expired sandboxes (called by EventBridge every 15 min) |
| `/ai/chat` | POST | Proxy LLM calls to Vercel AI Gateway (keeps key server-side) |

All endpoints return JSON with CORS headers (`Access-Control-Allow-Origin: *`).
