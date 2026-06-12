import React, { useState, useEffect, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { marked } from "marked";

import {
  Aurora,
  BeforeAfter,
  Button,
  ChatBubble,
  CommunityBadge,
  EyebrowPill,
  GlassCard,
  GradientText,
  LogoMarquee,
  Popover,
  PricingCard,
  PromptHero,
  Rotator,
  Sparkle,
  StatusDot,
  StickyBanner,
} from "performative-ui";

// (paid-return detection is handled inside the component via popup polling)

// ─── Constants ───────────────────────────────────────────────────────

const STRONG_THRESHOLD = 5000;
const GITHUB_BASE =
  "https://raw.githubusercontent.com/codename-co/stack/main/hub";

const EXODUS_API = "https://d6lzsqpg2b.execute-api.us-west-2.amazonaws.com";

const STRIPE_PAYMENT_LINK =
  "https://buy.stripe.com/test_bJe6oH83g7xCaYdbdUew801";

const SANDBOX_TTL_MS = 5 * 60 * 60 * 1000; // 5 hours in ms

// ─── i18n ────────────────────────────────────────────────────────────

const LANGS = {
  en: "English",
  // ── Western European ──
  de: "Deutsch",
  es: "Español",
  fr: "Français",
  it: "Italiano",
  nl: "Nederlands",
  pt: "Português",
  // ── Central / Eastern European ──
  pl: "Polski",
  tr: "Türkçe",
  ru: "Русский",
  // ── East Asian ──
  zh: "中文",
  ja: "日本語",
  ko: "한국어",
  // ── Southeast Asian ──
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  th: "ไทย",
  vi: "Tiếng Việt",
  // ── South Asian ──
  bn: "বাংলা",
  hi: "हिन्दी",
  // ── RTL ──
  ar: "العربية",
  fa: "فارسی",
  ur: "اردو",
};
const HTML_LANGS = {
  en: "en",
  de: "de",
  es: "es",
  fr: "fr",
  it: "it",
  nl: "nl",
  pt: "pt",
  pl: "pl",
  tr: "tr",
  ru: "ru",
  zh: "zh-CN",
  ja: "ja",
  ko: "ko",
  id: "id",
  ms: "ms",
  th: "th",
  vi: "vi",
  bn: "bn",
  hi: "hi",
  ar: "ar",
  fa: "fa",
  ur: "ur",
};
const OG_LOCALES = {
  en: "en_US",
  de: "de_DE",
  es: "es_ES",
  fr: "fr_FR",
  it: "it_IT",
  nl: "nl_NL",
  pt: "pt_BR",
  pl: "pl_PL",
  tr: "tr_TR",
  ru: "ru_RU",
  zh: "zh_CN",
  ja: "ja_JP",
  ko: "ko_KR",
  id: "id_ID",
  ms: "ms_MY",
  th: "th_TH",
  vi: "vi_VN",
  bn: "bn_IN",
  hi: "hi_IN",
  ar: "ar_AR",
  fa: "fa_IR",
  ur: "ur_PK",
};
// Text direction per language — rtl for Arabic, Urdu & Farsi, ltr otherwise
const LANG_DIRS = { ar: "rtl", ur: "rtl", fa: "rtl" };
const SITE_URL = "https://exodus.stack.lol";
const LANG_KEY = "exodus_lang";

const I18N = {
  en: {
    meta_title: "Exodus — Eject from SaaS. Self-host in 2 minutes.",
    meta_description:
      "Pick the SaaS tools you pay for. An AI agent finds free, open-source alternatives — fetches the Docker Compose files — and hands you a ready-to-run stack. You approve every choice.",
    og_title: "Exodus — Eject from SaaS",
    og_description:
      "Type the SaaS tools you pay for. A deterministic agent finds open-source alternatives, you approve every choice, and one click deploys them — self-hosted in under 2 minutes.",
    banner_text: "🏆 Built {solo} at SuperAI NEXT Hackathon '26, Singapore",
    banner_solo: "solo",
    banner_cta: "View contest →",
    hero_title: "Eject from {tool}",
    hero_sub:
      "Tell me which SaaS you pay for. I'll find the best {oss}, and deploy them to {cloud}. All in under two minutes.",
    hero_sub_oss: "open-source alternatives",
    hero_sub_cloud: "your own cloud",
    prompt_placeholder:
      "Which tools do you use? (e.g. Notion, Slack, GitLab, Grafana…)",
    prompt_cta: "Build my stack",
    tool_identify_tools: "Identify tools",
    tool_ai_match: "Ask AI",
    tool_match_alternative: "Look for alternatives",
    tool_exa_search: "Search the web",
    tool_fetch_compose: "Fetch the compose file",
    tool_parse_image: "Parse image",
    tool_deploy_ecs: "Deploy to AWS ECS",
    tool_check_health: "Healthcheck",
    res_no_exact_match: "no exact match — asking AI",
    res_no_tools: "no tools identified",
    res_saas_count: "{n} SaaS",
    res_oss_count: "{n} open-source",
    res_no_match_catalog: "no match in catalog",
    res_already_recommended: "{name} — already recommended",
    res_user_decides: "{n} candidates — user decides",
    res_not_found: "not found",
    res_provisioned: "provisioned",
    res_all_healthy: "all healthy ✓",
    res_timeout: "timeout",
    res_error: "error: {msg}",
    res_results: "{n} result(s)",
    svc_count: "{n} service(s)",
    thk_checking: "checking…",
    thk_selecting: "selecting…",
    thk_waiting_choice: "waiting for your choice…",
    thk_starting_stacks: "starting your stacks…",
    thk_waiting_payment: "waiting for payment…",
    thk_deploying_aws: "deploying to AWS…",
    thk_waiting_services: "waiting for services…",
    msg_no_tools_found:
      'I couldn\'t identify any tools in your message — even with AI assistance. Try mentioning specific tools — for example: "We use Notion, Slack, and Grafana" or "Datadog, GitHub, GitLab".',
    msg_all_oss:
      "All the tools I found are **already open-source** — you're in great shape! No SaaS to replace. 🎉",
    msg_desktop_not_running:
      "The **Stack Desktop app** isn't running. Open it first, then try again. [Get it here](https://stack.lol/download).",
    msg_payment_wait:
      "Complete your payment in the Stripe window. This will continue automatically.",
    msg_payment_received: "✔ **Payment received**",
    msg_no_images:
      "Could not extract Docker images from the compose files. Deploy requires an `image:` field.",
    oss_already: "{name} is {green} — no replacement needed.",
    oss_already_green: "already open-source",
    stars_license: "★ {stars} stars · {license}",
    replaces_suffix: " · replaces {names}",
    web_results_intro: "Here's what the web says about {name}:",
    web_no_results: "No relevant results found.",
    web_powered: "Powered by Exa",
    autosel_for: "For replacing {saas}, I recommend:",
    autosel_plain: "I recommend:",
    view_on_stacklol: "View on stack.lol →",
    search_web_btn: "🌐 Search the web",
    searching_btn: "🌐 searching…",
    search_web_title: "Search the web for more info",
    autosel_ready: "✓ Open-source and ready to deploy",
    autosel_selected_strong: "✓ Auto-selected (top-rated)",
    autosel_selected_best: "✓ Auto-selected (best available)",
    hitl_msg: "I found {alts} to {saas}. Which one fits your team best?",
    hitl_alts: "{n} strong alternatives",
    hitlrec_msg:
      "I found {tools} that match your needs. Pick the ones you'd like to deploy:",
    hitlrec_tools: "{n} open-source tools",
    selected_btn: "✓ Selected",
    select_btn: "Select",
    details_btn: "details ↗",
    more_btn: "more",
    more_btn_loading: "more…",
    confirm_selection: "Confirm selection",
    recipe_ready: "Ready to deploy",
    recipe_replaces: "replaces {name}",
    open_btn: "Open ↗",
    run_locally: "▶ Run locally",
    deploy_cloud: "Deploy to cloud • $1",
    status_live: "live",
    status_error: "error",
    status_starting: "starting…",
    status_pending: "pending",
    status_deploying: "deploying…",
    cloud_live: "Your stack is live",
    preview_btn: "Preview {name} ↗",
    open_name_btn: "Open {name} →",
    countdown_expired: "Expired",
    countdown_hm: "{h}h {m}m remaining",
    countdown_ms: "{m}m {s}s remaining",
    hitl_waiting_bar: "Waiting for your selection on {names}",
    social_proof: "Replacements for all of these — ready to deploy:",
    why_eyebrow: "Why self-host",
    why_title: "Three reasons teams {grad}",
    why_title_grad: "eject from SaaS.",
    why1_title: "Data sovereignty",
    why1_body:
      "Your data lives on your infrastructure, in your region, under your jurisdiction. No third-party access, no cross-border transfers, no surprise policy changes.",
    why2_title: "Vendor independence",
    why2_body:
      'No lock-in. No forced migrations when a vendor pivots. No "we\'re sunsetting this feature" emails. You own the software — it runs on your terms, forever.',
    why3_title: "Predictable costs",
    why3_body:
      "SaaS bills scale with seats. Self-hosted costs scale with usage. A 20-person team can replace $2,000–5,000/mo in subscriptions with ~$50/mo of compute.",
    ba_before_label: "With SaaS",
    ba_after_label: "With Exodus",
    ba_before_1: "Data on someone else's servers",
    ba_before_2: "Per-seat pricing that grows with your team",
    ba_before_3: "Vendor decides when features change",
    ba_before_4: "Locked in — migration is painful",
    ba_after_1: "Data on your own infrastructure",
    ba_after_2: "Fixed compute cost, unlimited seats",
    ba_after_3: "You control every update",
    ba_after_4: "Open source — switch anytime",
    how_eyebrow: "How it works",
    how_title: "Three steps. {grad}",
    how_title_grad: "You stay in control.",
    how1_title: "Name your tools",
    how1_body:
      "Type the SaaS your team uses — Notion, Slack, Jira, Datadog, whatever. Exodus recognizes {count}+ products instantly.",
    how1_link: "Try it now",
    how2_title: "Pick your replacements",
    how2_body:
      "The agent matches each tool to the top-rated open-source alternative. Clear winner? Auto-selected. Close call? {you}",
    how2_you: "You decide.",
    how3_title: "Deploy in one click",
    how3_body:
      "Your entire stack goes live on AWS with its own HTTPS subdomain — or download the Docker Compose and run it yourself.",
    feat_eyebrow: "Features",
    feat_title: "Everything you need to {grad}",
    feat_title_grad: "break free from SaaS.",
    feat1_title: "{count}+ alternatives",
    feat1_body:
      "A curated catalog of open-source tools mapped to the SaaS they replace — ranked by GitHub stars and battle-tested by the community.",
    feat2_title: "You approve every choice",
    feat2_body:
      "The agent auto-selects clear winners and asks you on close calls. No black-box decisions — you see every option and make the final call.",
    feat3_title: "Live in two minutes",
    feat3_body:
      "One click deploys to AWS ECS Fargate. Each service gets its own HTTPS subdomain — preview it right from this page.",
    feat4_title: "Works offline too",
    feat4_body:
      "Every stack comes with a production-grade {compose} and {env}. Download, {cmd}, done.",
    feat5_title: "Your data, your rules",
    feat5_body:
      "Self-hosted means no vendor lock-in, no surprise price hikes, no terms-of-service changes. Your infrastructure, your terms.",
    feat6_title: "Preview before you commit",
    feat6_body:
      "Open your deployed services directly inside Exodus. See them running live before you make the switch.",
    pricing_eyebrow: "Pricing",
    pricing_title: "The software is free. {grad}",
    pricing_title_grad: "We handle the rest.",
    price1_tier: "DIY",
    price1_amount: "Free",
    price1_blurb: "Compose & run your stack on your own machine, for free.",
    price1_f1: "Agentic stack composer",
    price1_f2: "Download Docker Compose + .env",
    price1_f3: "Run on your own machine",
    get_started: "Get started",
    price2_flag: "Try it live",
    price2_tier: "Hosted Cloud",
    price2_unit: "per stack, 5h sandbox",
    price2_blurb:
      "See your stack running live for 5 hours. Evaluate it, then self-host or upgrade.",
    price2_f1: "One-click deploy to AWS",
    price2_f2: "HTTPS subdomain for 5 hours",
    price2_f3: "Export config before expiry",
    price3_flag: "Lazy cost-cutting",
    price3_tier: "Fully Managed",
    price3_unit: "per month, per server",
    price3_blurb:
      "We host and maintain your stack for you. Focus on your work, not server upkeep.",
    price3_f1: "Everything in Hosted Cloud",
    price3_f2: "Managed updates, security & uptime",
    price3_f3: "24/7 monitoring and support",
    contact_us: "Contact Us",
    closer_1: "Own your tools.",
    closer_2: "Stop renting software.",
    closer_cta: "Build my stack — free",
    footer_tagline: "Eject from SaaS. Own your stack.",
    footer_product: "Product",
    footer_community: "Community",
    badge_star: "Star us on GitHub",
    badge_tested: "Tested & ready to run",
    footer_built: "Built at SuperAI NEXT Hackathon",
    close_label: "Close",
    exa_prompt:
      "Enter your Exa API key to enable web search (get one at https://dashboard.exa.ai):",
  },
  // Non-English locales live in locales.json, merged in before mount.
};

// Resolution order: ?lang= URL param → localStorage → browser
// language (first load only — the detected value is persisted so
// detection never overrides a previous visit) → English.
const detectLang = () => {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (fromUrl && I18N[fromUrl]) {
      localStorage.setItem(LANG_KEY, fromUrl);
      return fromUrl;
    }
    const stored = localStorage.getItem(LANG_KEY);
    if (stored && I18N[stored]) return stored;
    for (const tag of navigator.languages ?? [navigator.language]) {
      const base = (tag ?? "").slice(0, 2).toLowerCase();
      if (I18N[base]) {
        localStorage.setItem(LANG_KEY, base);
        return base;
      }
    }
    localStorage.setItem(LANG_KEY, "en");
  } catch {}
  return "en";
};

// Set just before mount, once locales.json is merged into I18N —
// detectLang validates languages against the I18N keys.
let currentLang = "en";

// t: plain-string lookup with {param} interpolation.
const t = (key, params) => {
  let s = I18N[currentLang]?.[key] ?? I18N.en[key] ?? key;
  if (params)
    for (const [k, v] of Object.entries(params))
      s = s.split(`{${k}}`).join(String(v));
  return s;
};

// tx: like t, but {slot}s resolve to React nodes — lets translations
// reorder rich elements (<strong>, <GradientText>…) per language.
const tx = (key, slots = {}) =>
  t(key)
    .split(/(\{\w+\})/g)
    .map((part, i) => {
      const m = part.match(/^\{(\w+)\}$/);
      if (!m) return part;
      return (
        <React.Fragment key={i}>{slots[m[1]] ?? `{${m[1]}}`}</React.Fragment>
      );
    });

function LangSwitcher({ lang, onChange }) {
  return (
    <select
      value={lang}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Language"
      className="text-sm text-[#a8a8b3] border border-white/10 rounded-lg px-2 py-1 cursor-pointer"
      style={{ background: "transparent" }}
    >
      {Object.entries(LANGS).map(([code, label]) => (
        <option key={code} value={code} style={{ background: "#0a0a0f" }}>
          {label}
        </option>
      ))}
    </select>
  );
}

// ─── Countdown Hook & Badge ──────────────────────────────────────

function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState(() =>
    expiresAt ? Math.max(0, expiresAt - Date.now()) : null,
  );
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setRemaining(Math.max(0, expiresAt - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  if (remaining === null) return null;
  if (remaining <= 0)
    return {
      h: 0,
      m: 0,
      s: 0,
      expired: true,
      label: t("countdown_expired"),
    };
  const h = Math.floor(remaining / 3_600_000);
  const m = Math.floor((remaining % 3_600_000) / 60_000);
  const s = Math.floor((remaining % 60_000) / 1000);
  const label =
    h > 0 ? t("countdown_hm", { h, m }) : t("countdown_ms", { m, s });
  return { h, m, s, expired: false, label };
}

function CountdownBadge({ expiresAt }) {
  const cd = useCountdown(expiresAt);
  if (!cd) return null;
  const urgent = !cd.expired && cd.h === 0 && cd.m < 30;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium"
      style={{
        background: cd.expired
          ? "rgba(239,68,68,0.12)"
          : urgent
            ? "rgba(245,158,11,0.12)"
            : "rgba(34,197,94,0.10)",
        color: cd.expired ? "#ef4444" : urgent ? "#f59e0b" : "#22c55e",
        border: `1px solid ${cd.expired ? "rgba(239,68,68,0.25)" : urgent ? "rgba(245,158,11,0.25)" : "rgba(34,197,94,0.2)"}`,
      }}
    >
      <span style={{ fontSize: "0.7rem" }}>
        {cd.expired ? "💀" : urgent ? "⏳" : "⏱"}
      </span>
      {cd.label}
    </span>
  );
}

const SAAS_NAMES = {
  "1password": "1Password",
  "adobe-xd": "Adobe XD",
  "after-effects": "After Effects",
  amazonapigateway: "Amazon API Gateway",
  amazons3: "Amazon S3",
  auth0: "Auth0",
  dockerhub: "Docker Hub",
  "fast.com": "Fast.com",
  google: "Google Search",
  "google-analytics": "Google Analytics",
  "google-meet": "Google Meet",
  "google-photos": "Google Photos",
  "google-sheets": "Google Sheets",
  googlecloudstorage: "Google Cloud Storage",
  googledrive: "Google Drive",
  "jfrog-artifactory": "JFrog Artifactory",
  langsmith: "LangSmith",
  launchdarkly: "LaunchDarkly",
  "microsoft-office": "Microsoft Office",
  newrelic: "New Relic",
  onlyoffice: "OnlyOffice",
  powerapps: "Power Apps",
  powerbi: "Power BI",
  youtube: "YouTube",
};

// AI products excluded — Exodus focuses on replacing traditional SaaS, not AI tools
const EXCLUDED_SAAS = new Set([
  "chatgpt",
  "claude",
  "github-copilot",
  "google-notebook-lm",
  "midjourney",
  "perplexity",
]);

// AI Gateway model slugs use dots for versions, not hyphens
const AI_MODELS = [
  "anthropic/claude-haiku-4.5",
  "anthropic/claude-sonnet-4.6",
  "google/gemini-2.5-pro",
];

// ─── Agent Tools ────────────────────────────────────────────────────

const AGENT_TOOLS = {
  identify_tools: {
    label: "Identify tools",
    icon: "🔍",
    description: "Parse input and identify SaaS & open-source products",
  },
  ai_match: {
    label: "Ask AI",
    icon: "✨",
    description:
      "Generative AI maps free-form input to catalog tools when pattern matching fails",
  },
  match_alternative: {
    label: "Look for alternatives",
    icon: "📚",
    description: "Search catalog for open-source replacements",
  },
  exa_search: {
    label: "Search the web",
    icon: "🌐",
    description: "Search supplemental info about a tool via Exa",
  },
  fetch_compose: {
    label: "Fetch the compose file",
    icon: "📦",
    description: "Fetch Docker Compose config from registry",
  },
  parse_image: {
    label: "Parse image",
    icon: "🐳",
    description: "Extract container image from Compose file",
  },
  deploy_ecs: {
    label: "Deploy to AWS ECS",
    icon: "☁️",
    description: "Provision service on AWS ECS Fargate",
  },
  check_health: {
    label: "Healthcheck",
    icon: "💚",
    description: "Poll deployment health status",
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
let _msgSeq = 0;
const msgId = () => `m-${++_msgSeq}-${Date.now()}`;

// Whole-word term matching: "dash" must not match inside "dashboards"
const isWordChar = (ch) => /[a-z0-9]/i.test(ch ?? "");

const findTermRanges = (lowerText, term) => {
  const ranges = [];
  let i = 0;
  while ((i = lowerText.indexOf(term, i)) !== -1) {
    const before = lowerText[i - 1];
    const after = lowerText[i + term.length];
    if (!isWordChar(before) && !isWordChar(after)) {
      ranges.push([i, i + term.length]);
    }
    i += term.length;
  }
  return ranges;
};

const hasWholeWord = (lowerText, term) =>
  findTermRanges(lowerText, term).length > 0;

const saasDisplayName = (slug) =>
  SAAS_NAMES[slug] ??
  slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const siIcon = (name) =>
  `https://esm.sh/simple-icons@16/icons/${name.toLowerCase().replaceAll(" ", "")}.svg`;

const SiImg = ({ name, className, ...props }) => (
  <img
    src={siIcon(name)}
    alt={`${name} logo`}
    className={className}
    onError={(e) => {
      e.currentTarget.style.display = "none";
    }}
    {...props}
    style={{ filter: "var(--pui-logo-filter)", ...props.style }}
  />
);

const downloadFile = (content, filename) => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── Cloud Deploy Helpers ────────────────────────────────────────────

const parseComposeImage = (compose) => {
  if (!compose) return null;
  const match = compose.match(/image:\s*['"]?([^\s'"]+)/);
  if (!match) return null;
  // Resolve ${VAR:-default} and ${VAR-default} to default value
  return match[1].replace(/\$\{[^}]*:-?([^}]*)\}/g, "$1");
};

const parseComposePort = (compose) => {
  if (!compose) return 80;
  const mapping = compose.match(/['"](\d+):(\d+)/);
  if (mapping) return parseInt(mapping[2]);
  const standalone = compose.match(/ports:\s*\n\s*-\s*['"]?(\d+)/);
  if (standalone) return parseInt(standalone[1]);
  return 80;
};

/**
 * Ask an LLM (via the AI Gateway, proxied through the Exodus API) to
 * map free-form user text to known catalog slugs. Used only when
 * simple pattern matching finds nothing. Returns { saas: [], oss: [] }.
 */
async function aiIdentifyTools(text, saasCatalog, ossStacks) {
  const saasList = saasCatalog.map((t) => `${t.slug} (${t.name})`).join(", ");
  const ossList = ossStacks.map((s) => s.slug).join(", ");

  const r = await fetch(`${EXODUS_API}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: AI_MODELS[0],
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content:
            "You map a user's description of the software they use — or the problems they want to solve — to known catalog slugs.\n\n" +
            `Valid SaaS slugs: ${saasList}\n\n` +
            `Valid open-source slugs: ${ossList}\n\n` +
            'Reply with JSON only, no prose: {"saas": ["slug", …], "oss": ["slug", …]}. ' +
            "Only include slugs from the lists above that clearly match tools the user names (even with typos) or describes by function. " +
            'If nothing matches, reply {"saas": [], "oss": []}.',
        },
        { role: "user", content: text },
      ],
    }),
  });
  const data = await r.json().catch(() => ({}));
  if (r.status === 501) throw new Error("AI not configured on server");
  if (!r.ok)
    throw new Error(
      data.error?.message || data.error || `AI Gateway returned ${r.status}`,
    );
  const content = data.choices?.[0]?.message?.content ?? "";
  const json = content.match(/\{[\s\S]*\}/);
  if (!json) throw new Error("unparsable AI response");
  const parsed = JSON.parse(json[0]);
  return {
    saas: Array.isArray(parsed.saas) ? parsed.saas : [],
    oss: Array.isArray(parsed.oss) ? parsed.oss : [],
  };
}

// ─── Exa Web Search ─────────────────────────────────────────────────

function getExaApiKey() {
  let key = localStorage.getItem("EXA_API_KEY");
  if (!key) {
    key = window.prompt(t("exa_prompt"));
    if (key) localStorage.setItem("EXA_API_KEY", key.trim());
  }
  return key?.trim() || null;
}

/**
 * Search the web via Exa for supplemental info about a tool/stack.
 * Returns an array of { title, url, publishedDate, text } results.
 */
async function exaSearch(query, numResults = 4) {
  const key = getExaApiKey();
  if (!key) throw new Error("no API key provided");
  const r = await fetch(`https://api.exa.ai/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-api-key": key },
    body: JSON.stringify({
      query,
      type: "auto",
      numResults,
      contents: { text: { maxCharacters: 280 } },
    }),
  });
  if (r.status === 401 || r.status === 403) {
    localStorage.removeItem("EXA_API_KEY");
    throw new Error("invalid API key");
  }
  if (!r.ok) throw new Error(`Exa API returned ${r.status}`);
  const data = await r.json();
  return data.results ?? [];
}

// ─── Stack Desktop API ──────────────────────────────────────────────

const STACK_API = "https://127.0.0.1:57404";
const STACK_DOWNLOAD_BASE = "https://stack.lol/downloads";

async function isStackAppRunning() {
  try {
    const r = await fetch(`${STACK_API}/health`, {
      signal: AbortSignal.timeout(1500),
    });
    return (await r.text()).trim() === "OK";
  } catch {
    return false;
  }
}

/**
 * Ask the Stack Desktop app to run a stack from the catalog.
 * POSTs the public download URL — the Desktop app fetches,
 * extracts, and docker-compose-ups it.
 * Returns a ReadableStream of log lines, or throws on failure.
 */
async function runStackFromCatalog(slug) {
  const downloadUrl = `${STACK_DOWNLOAD_BASE}/${slug}.stack`;
  const r = await fetch(`${STACK_API}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug: downloadUrl }),
  });
  if (!r.ok) throw new Error(`Stack API returned ${r.status}`);
  return r.body;
}

/**
 * Consume a ReadableStream of log text and call onLine for each chunk.
 */
async function streamLogs(body, onLine) {
  const reader = body.getReader();
  const dec = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onLine(dec.decode(value, { stream: true }));
  }
}

// ─── HighlightedPrompt ──────────────────────────────────────────────

function HighlightedPrompt({ catalog, stacks, ...promptProps }) {
  const wrapperRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || (catalog.length === 0 && stacks.length === 0)) return;

    const terms = [];
    const seen = new Set();
    for (const t of catalog) {
      const nl = t.name.toLowerCase();
      if (nl.length >= 2 && !seen.has(nl)) {
        terms.push(nl);
        seen.add(nl);
      }
      const sl = (t.slug ?? "").toLowerCase();
      if (sl.length >= 2 && !seen.has(sl)) {
        terms.push(sl);
        seen.add(sl);
      }
    }
    for (const s of stacks) {
      const nl = s.name.toLowerCase();
      if (nl.length >= 2 && !seen.has(nl)) {
        terms.push(nl);
        seen.add(nl);
      }
      const sl = (s.slug ?? "").toLowerCase();
      if (sl.length >= 2 && !seen.has(sl)) {
        terms.push(sl);
        seen.add(sl);
      }
    }
    terms.sort((a, b) => b.length - a.length);

    const esc = (s) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const buildHTML = (text) => {
      if (!text) return "";
      const lower = text.toLowerCase();
      const ranges = [];
      for (const term of terms) {
        ranges.push(...findTermRanges(lower, term));
      }
      if (!ranges.length) return esc(text);
      ranges.sort((a, b) => a[0] - b[0]);
      const merged = [];
      for (const r of ranges) {
        const last = merged[merged.length - 1];
        if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
        else merged.push([...r]);
      }
      let html = "",
        c = 0;
      for (const [s, e] of merged) {
        html += esc(text.slice(c, s));
        html += `<mark>${esc(text.slice(s, e))}</mark>`;
        c = e;
      }
      return html + esc(text.slice(c));
    };

    const COPY_PROPS = [
      "fontFamily",
      "fontSize",
      "fontWeight",
      "fontStyle",
      "fontVariant",
      "fontStretch",
      "lineHeight",
      "letterSpacing",
      "wordSpacing",
      "textAlign",
      "textIndent",
      "textTransform",
      "textDecoration",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "borderTopWidth",
      "borderRightWidth",
      "borderBottomWidth",
      "borderLeftWidth",
      "boxSizing",
      "tabSize",
      "direction",
      "writingMode",
    ];

    let ta = null,
      mirror = null,
      disposed = false,
      lastVal = "\0";
    let origColor = "";

    const setupMirror = () => {
      origColor = getComputedStyle(ta).color;
      mirror = document.createElement("div");
      mirror.setAttribute("aria-hidden", "true");
      wrapper.style.position = "relative";
      wrapper.appendChild(mirror);
      ta.style.color = "transparent";
      ta.style.caretColor = origColor;
      ta.addEventListener("scroll", () => {
        if (!mirror) return;
        if (ta.tagName === "INPUT") {
          mirror.scrollLeft = ta.scrollLeft;
        } else {
          mirror.scrollTop = ta.scrollTop;
        }
      });
    };

    const syncMirror = () => {
      if (!ta || !mirror) return;
      const cs = getComputedStyle(ta);
      const wRect = wrapper.getBoundingClientRect();
      const tRect = ta.getBoundingClientRect();
      const isInput = ta.tagName === "INPUT";
      Object.assign(mirror.style, {
        position: "absolute",
        top: tRect.top - wRect.top + "px",
        left: tRect.left - wRect.left + "px",
        width: tRect.width + "px",
        height: tRect.height + "px",
        pointerEvents: "none",
        overflow: "hidden",
        whiteSpace: isInput ? "nowrap" : "pre-wrap",
        wordWrap: isInput ? "normal" : "break-word",
        overflowWrap: isInput ? "normal" : "break-word",
        color: origColor,
        background: "transparent",
        borderStyle: cs.borderStyle,
        borderColor: "transparent",
        zIndex: "0",
      });
      for (const prop of COPY_PROPS) mirror.style[prop] = cs[prop];
    };

    const tick = () => {
      if (disposed) return;
      if (!ta) {
        ta =
          wrapper.querySelector("textarea") ||
          wrapper.querySelector('input[type="text"]');
        if (ta) setupMirror();
      }
      if (ta && mirror) {
        syncMirror();
        if (ta.value !== lastVal) {
          lastVal = ta.value;
          mirror.innerHTML = buildHTML(lastVal) || "\u200b";
        }
        // Sync scroll — horizontal for inputs, vertical for textareas
        if (ta.tagName === "INPUT") {
          mirror.scrollLeft = ta.scrollLeft;
        } else {
          mirror.scrollTop = ta.scrollTop;
        }
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    return () => {
      disposed = true;
      if (ta) {
        ta.style.color = "";
        ta.style.caretColor = "";
      }
      mirror?.remove();
    };
  }, [catalog, stacks]);

  return (
    <div ref={wrapperRef} style={{ width: "100%" }}>
      <PromptHero {...promptProps} />
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────────

function App() {
  // i18n state
  const [lang, setLangState] = useState(currentLang);
  const changeLang = (l) => {
    if (!I18N[l] || l === lang) return;
    currentLang = l;
    try {
      localStorage.setItem(LANG_KEY, l);
    } catch {}
    try {
      const url = new URL(window.location.href);
      if (l === "en") url.searchParams.delete("lang");
      else url.searchParams.set("lang", l);
      history.replaceState(null, "", url);
    } catch {}
    setLangState(l);
  };

  // Keep document head in sync with the active language (SEO)
  useEffect(() => {
    const q = (sel) => document.querySelector(sel);
    const pageUrl =
      lang === "en" ? `${SITE_URL}/` : `${SITE_URL}/?lang=${lang}`;
    document.documentElement.lang = HTML_LANGS[lang];
    document.documentElement.dir = LANG_DIRS[lang] ?? "ltr";
    document.title = t("meta_title");
    q('meta[name="description"]')?.setAttribute(
      "content",
      t("meta_description"),
    );
    q('link[rel="canonical"]')?.setAttribute("href", pageUrl);
    q('meta[property="og:url"]')?.setAttribute("content", pageUrl);
    q('meta[property="og:title"]')?.setAttribute("content", t("og_title"));
    q('meta[property="og:description"]')?.setAttribute(
      "content",
      t("og_description"),
    );
    q('meta[property="og:locale"]')?.setAttribute("content", OG_LOCALES[lang]);
    q('meta[name="twitter:title"]')?.setAttribute("content", t("og_title"));
    q('meta[name="twitter:description"]')?.setAttribute(
      "content",
      t("og_description"),
    );
  }, [lang]);

  // Catalog state
  const [stacks, setStacks] = useState([]);
  const approxStackCount = 10 * Math.floor(stacks.length / 10) || 200;
  const [catalog, setCatalog] = useState([]);

  // AI model state
  // AI model state (reserved for future use)
  // const [aiModel, setAiModel] = useState(AI_MODELS[0]);

  // Conversation state
  const [messages, setMessages] = useState([]);
  const [phase, setPhase] = useState("idle"); // idle | analyzing | hitl | fetching | done
  const [selections, setSelections] = useState({}); // saasSlug → stack
  const [pendingHITL, setPendingHITL] = useState([]); // saasSlug[] needing user input
  const [fetchedFiles, setFetchedFiles] = useState({}); // slug → { compose, env }
  const [detailPopover, setDetailPopover] = useState(null); // { slug, name, link } | null
  const [servicePopover, setServicePopover] = useState(null); // { slug, name, domain } | null
  const [runProgress, setRunProgress] = useState({}); // slug → 'pending'|'running'|'live'|'error'
  const [isRunning, setIsRunning] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [searchingSlugs, setSearchingSlugs] = useState(new Set()); // slugs with an Exa search in flight
  const [sandboxExpiresAt, setSandboxExpiresAt] = useState(null);

  // Refs for async flow
  const convoRef = useRef(null);
  const selectionsRef = useRef({});
  selectionsRef.current = selections;

  // ── Message helpers ──
  const addMsg = useCallback((msg) => {
    const m = { id: msgId(), ...msg };
    setMessages((prev) => [...prev, m]);
    return m.id;
  }, []);

  const updateMsg = useCallback((id, updates) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    );
  }, []);

  // ── Auto-scroll ──
  useEffect(() => {
    if (convoRef.current) {
      convoRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }
  }, [messages]);

  // ── Fetch stacks on mount ──
  useEffect(() => {
    fetch("./stacks.json")
      .then((r) => r.json())
      .then((data) => {
        const items = data.items ?? [];
        setStacks(items);
        const saasTools = [
          ...new Set(items.flatMap((s) => s.alternativeTo ?? [])),
        ]
          .filter((slug) => !EXCLUDED_SAAS.has(slug))
          .map((slug) => ({ slug, name: saasDisplayName(slug) }))
          .sort((a, b) => a.name.localeCompare(b.name));
        setCatalog(saasTools);
      })
      .catch(() => {});
  }, []);

  // ── Match SaaS tools from user text ──
  const matchTools = (text) => {
    const lower = text.toLowerCase();
    return catalog.filter(
      (t) =>
        hasWholeWord(lower, t.name.toLowerCase()) ||
        hasWholeWord(lower, t.slug.toLowerCase()),
    );
  };

  // ── Match open-source stacks from user text ──
  const matchOSSTools = (text) => {
    const lower = text.toLowerCase();
    return stacks.filter(
      (s) =>
        hasWholeWord(lower, s.name.toLowerCase()) ||
        hasWholeWord(lower, s.slug.toLowerCase()),
    );
  };

  // ── Find alternatives for a SaaS tool ──
  const findAlternatives = (saasSlug) => {
    return stacks
      .filter((s) =>
        (s.alternativeTo ?? []).some(
          (a) => a.toLowerCase() === saasSlug.toLowerCase(),
        ),
      )
      .sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
  };

  // ── Exa web search: supplemental info about a tool/stack ──
  const handleWebSearch = async (stack) => {
    if (searchingSlugs.has(stack.slug)) return;
    setSearchingSlugs((prev) => new Set(prev).add(stack.slug));
    const toolId = addMsg({
      type: "tool-use",
      tool: "exa_search",
      input: stack.name,
      thinking: true,
    });
    try {
      const results = await exaSearch(
        `${stack.name} open-source self-hosted review`,
      );
      updateMsg(toolId, {
        thinking: false,
        result: t("res_results", { n: results.length }),
      });
      addMsg({
        role: "ai",
        agent: "Exodus",
        type: "web-results",
        thinking: false,
        stackName: stack.name,
        results,
      });
    } catch (e) {
      updateMsg(toolId, {
        thinking: false,
        result: t("res_error", { msg: e.message }),
      });
    } finally {
      setSearchingSlugs((prev) => {
        const next = new Set(prev);
        next.delete(stack.slug);
        return next;
      });
    }
  };

  // ── HITL selection handler ──
  const handleHITLSelect = (saasSlug, stack) => {
    setSelections((prev) => ({ ...prev, [saasSlug]: stack }));
    setPendingHITL((prev) => prev.filter((s) => s !== saasSlug));
    // Mark the corresponding HITL message as non-thinking
    setMessages((prev) =>
      prev.map((m) =>
        m.type === "hitl" && m.saasSlug === saasSlug
          ? { ...m, thinking: false }
          : m,
      ),
    );
  };

  // ── AI recommendation multi-select handler ──
  const handleRecommendToggle = (slug, stack) => {
    setSelections((prev) => {
      const next = { ...prev };
      if (next[slug]?.recommended) {
        delete next[slug];
      } else {
        next[slug] = { ...stack, recommended: true };
      }
      return next;
    });
  };

  const handleRecommendConfirm = () => {
    setPendingHITL((prev) => prev.filter((s) => s !== "_ai_recommend"));
    setMessages((prev) =>
      prev.map((m) =>
        m.type === "hitl-recommend" ? { ...m, thinking: false } : m,
      ),
    );
  };

  // ── Watch for HITL completion → proceed to fetch ──
  useEffect(() => {
    if (phase === "hitl" && pendingHITL.length === 0) {
      const timer = setTimeout(() => {
        proceedToFetch(selectionsRef.current);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [phase, pendingHITL]);

  // ── Fetch compose files & build recipe ──
  const proceedToFetch = async (allSelections) => {
    setPhase("fetching");

    const slugs = [...new Set(Object.values(allSelections).map((s) => s.slug))];

    const files = {};

    for (const slug of slugs) {
      const fetchToolId = addMsg({
        type: "tool-use",
        tool: "fetch_compose",
        input: slug,
        thinking: true,
      });

      const base = `${GITHUB_BASE}/${slug}`;
      files[slug] = {};

      try {
        const r = await fetch(`${base}/compose.yaml`);
        if (r.ok) files[slug].compose = await r.text();
      } catch {}

      try {
        const r = await fetch(`${base}/.env`);
        if (r.ok) files[slug].env = await r.text();
      } catch {}

      // Parse compose.yaml for additional env_file entries
      if (files[slug].compose) {
        const envFileMatches = [
          ...files[slug].compose.matchAll(
            /(?:env_file:\s*|\-\s+)(\.[a-zA-Z0-9._-]+\.env|[a-zA-Z0-9._-]+\.env)/gm,
          ),
        ].map((m) => m[1]);
        if (envFileMatches.length > 0) {
          for (const envPath of envFileMatches) {
            if (envPath && envPath !== ".env" && !files[slug][envPath]) {
              try {
                const r = await fetch(`${base}/${envPath}`);
                if (r.ok) files[slug][envPath] = await r.text();
              } catch {}
            }
          }
        }
      }

      const parts = [];
      if (files[slug].compose) parts.push("compose.yaml");
      if (files[slug].env) parts.push(".env");
      updateMsg(fetchToolId, {
        thinking: false,
        result: parts.length ? parts.join(" + ") : t("res_not_found"),
      });
    }

    setFetchedFiles(files);

    // Show recipe after all fetches complete
    addMsg({
      role: "ai",
      agent: "Exodus",
      type: "recipe",
      thinking: false,
      allSelections,
      files,
    });

    setPhase("done");
  };

  // ── Download helpers ──
  const downloadCompose = (files) => {
    const merged = Object.entries(files)
      .filter(([_, f]) => f.compose)
      .map(
        ([slug, f]) =>
          `# ════════════════════════════════════════\n# ${slug}\n# ════════════════════════════════════════\n\n${f.compose}`,
      )
      .join("\n\n");
    downloadFile(merged, "docker-compose.yml");
  };

  const downloadEnv = (files) => {
    const merged = Object.entries(files)
      .filter(([_, f]) => f.env)
      .map(([slug, f]) => `# ── ${slug} ──\n${f.env}`)
      .join("\n\n");
    downloadFile(merged, ".env");
  };

  // ── Run all stacks via Stack Desktop app ──
  const handleRunAll = async (allSelections) => {
    const appRunning = await isStackAppRunning();
    if (!appRunning) {
      addMsg({
        role: "ai",
        agent: "Exodus",
        type: "text",
        thinking: false,
        text: t("msg_desktop_not_running"),
      });
      return;
    }

    setIsRunning(true);
    const slugs = [...new Set(Object.values(allSelections).map((s) => s.slug))];

    // Initialize progress
    const initial = {};
    for (const s of slugs) initial[s] = "pending";
    setRunProgress(initial);

    const runMsgId = addMsg({
      role: "ai",
      agent: "Exodus",
      type: "run-progress",
      thinking: t("thk_starting_stacks"),
      slugs,
      logs: {},
    });

    const allLogs = {};

    for (const slug of slugs) {
      setRunProgress((prev) => ({ ...prev, [slug]: "running" }));
      allLogs[slug] = "";
      try {
        const body = await runStackFromCatalog(slug);
        await streamLogs(body, (chunk) => {
          allLogs[slug] += chunk;
          updateMsg(runMsgId, { logs: { ...allLogs } });
        });
        setRunProgress((prev) => ({ ...prev, [slug]: "live" }));
      } catch (err) {
        allLogs[slug] += `\n⚠ Error: ${err.message}`;
        updateMsg(runMsgId, { logs: { ...allLogs } });
        setRunProgress((prev) => ({ ...prev, [slug]: "error" }));
      }
    }

    updateMsg(runMsgId, { thinking: false });
    setIsRunning(false);
  };

  // ── Stripe payment gate (opens in new window, polls for close) ──
  const handlePayAndDeploy = (allSelections, files) => {
    const stackCount = new Set(Object.values(allSelections).map((s) => s.slug))
      .size;

    // Open Stripe in a new window (stays on same origin)
    const stripeWin = window.open(
      `${STRIPE_PAYMENT_LINK}?prefilled_quantity=${stackCount}`,
      "stripe_checkout",
      "width=600,height=700,left=200,top=100",
    );

    // Show waiting state
    const waitId = addMsg({
      role: "ai",
      agent: "Exodus",
      type: "text",
      thinking: t("thk_waiting_payment"),
      text: t("msg_payment_wait"),
    });

    // Poll until the Stripe window is closed
    const poll = setInterval(() => {
      if (!stripeWin || stripeWin.closed) {
        clearInterval(poll);
        updateMsg(waitId, {
          thinking: false,
          text: t("msg_payment_received"),
        });
        addMsg({
          role: "ai",
          agent: "Exodus",
          type: "recipe",
          thinking: false,
          allSelections,
          files,
        });
        setTimeout(() => handleCloudDeploy(allSelections, files), 600);
      }
    }, 1000);
  };

  // ── Cloud deploy to AWS ──
  const handleCloudDeploy = async (allSelections, files) => {
    setIsDeploying(true);
    const slugs = [...new Set(Object.values(allSelections).map((s) => s.slug))];

    // Tool: parse_image for each stack
    const stackPayload = [];
    for (const slug of slugs) {
      // const parseId = addMsg({
      //   type: "tool-use",
      //   tool: "parse_image",
      //   input: slug,
      //   thinking: true,
      // });
      await delay(250);

      const compose = files[slug]?.compose || "";
      const image = parseComposeImage(compose);
      if (!image) {
        // updateMsg(parseId, { thinking: false, result: "no image found" });
        continue;
      }
      const port = parseComposePort(compose);
      stackPayload.push({ name: slug, image, port });
      // updateMsg(parseId, {
      //   thinking: false,
      //   result: `${image} :${port}`,
      // });
    }

    if (!stackPayload.length) {
      addMsg({
        role: "ai",
        agent: "Exodus",
        type: "text",
        thinking: false,
        text: t("msg_no_images"),
      });
      setIsDeploying(false);
      return;
    }

    // Tool: deploy_ecs
    const deployToolId = addMsg({
      type: "tool-use",
      tool: "deploy_ecs",
      input: t("svc_count", { n: stackPayload.length }),
      thinking: true,
    });

    const deployMsgId = addMsg({
      role: "ai",
      agent: "Exodus",
      type: "cloud-deploy",
      thinking: t("thk_deploying_aws"),
      deployments: [],
      services: [],
    });

    try {
      const resp = await fetch(`${EXODUS_API}/deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stacks: stackPayload }),
      });
      const data = await resp.json();
      if (!resp.ok)
        throw new Error(data.error || `Deploy failed (${resp.status})`);

      updateMsg(deployToolId, {
        thinking: false,
        result: t("res_provisioned"),
      });
      const expiresAt = Date.now() + SANDBOX_TTL_MS;
      setSandboxExpiresAt(expiresAt);
      updateMsg(deployMsgId, {
        deployments: data.deployments,
        expiresAt,
      });

      // Tool: check_health
      const healthToolId = addMsg({
        type: "tool-use",
        tool: "check_health",
        input: t("svc_count", { n: stackPayload.length }),
        thinking: true,
      });

      // Poll /status until all services are healthy
      let attempts = 0;
      const poll = async () => {
        if (attempts++ > 30) {
          updateMsg(healthToolId, {
            thinking: false,
            result: t("res_timeout"),
          });
          updateMsg(deployMsgId, { thinking: false });
          setIsDeploying(false);
          return;
        }
        try {
          const sr = await fetch(`${EXODUS_API}/status`);
          const sd = await sr.json();
          const deploySlugs = data.deployments.map((d) => d.slug);
          const relevant = (sd.services || []).filter((s) =>
            deploySlugs.includes(s.slug),
          );
          const allHealthy =
            relevant.length === deploySlugs.length &&
            relevant.every((s) => s.healthy);

          updateMsg(deployMsgId, {
            services: relevant,
            thinking: allHealthy ? false : t("thk_waiting_services"),
          });

          if (allHealthy) {
            updateMsg(healthToolId, {
              thinking: false,
              result: t("res_all_healthy"),
            });
            setIsDeploying(false);
            return;
          }
        } catch {}
        setTimeout(poll, 10000);
      };
      setTimeout(poll, 10000);
    } catch (e) {
      updateMsg(deployToolId, {
        thinking: false,
        result: t("res_error", { msg: e.message }),
      });
      updateMsg(deployMsgId, {
        thinking: false,
        error: e.message,
      });
      setIsDeploying(false);
    }
  };

  // ── The Agent ──
  const runAgent = async (text) => {
    // Reset state
    setMessages([]);
    setSelections({});
    setPendingHITL([]);
    setFetchedFiles({});
    setRunProgress({});
    setIsRunning(false);
    selectionsRef.current = {};
    setPhase("analyzing");

    await delay(50);

    // User message
    addMsg({ role: "user", type: "text", text });
    await delay(400);

    // Tool: identify_tools
    const identifyId = addMsg({
      type: "tool-use",
      tool: "identify_tools",
      input: text.length > 40 ? text.slice(0, 37) + "…" : text,
      thinking: true,
    });
    await delay(1000);

    // Match SaaS tools
    const matched = matchTools(text);
    const uniqueMatched = [];
    const seenSlugs = new Set();
    for (const t of matched) {
      if (!seenSlugs.has(t.slug)) {
        seenSlugs.add(t.slug);
        uniqueMatched.push(t);
      }
    }

    // Match open-source tools (exclude any that overlap with SaaS names)
    const matchedOSS = matchOSSTools(text);
    const uniqueOSS = [];
    const seenOSSSlugs = new Set();
    for (const s of matchedOSS) {
      if (!seenOSSSlugs.has(s.slug) && !seenSlugs.has(s.slug)) {
        seenOSSSlugs.add(s.slug);
        uniqueOSS.push(s);
      }
    }

    // Track OSS tools suggested by AI (recommendations, not "already owned")
    const aiSuggestedOSS = new Set();

    if (uniqueMatched.length === 0 && uniqueOSS.length === 0) {
      // Pattern matching found nothing — escalate to generative AI
      updateMsg(identifyId, {
        thinking: false,
        result: t("res_no_exact_match"),
      });

      const aiId = addMsg({
        type: "tool-use",
        tool: "ai_match",
        input: text.length > 40 ? text.slice(0, 37) + "…" : text,
        thinking: true,
      });

      try {
        const ai = await aiIdentifyTools(text, catalog, stacks);
        for (const slug of ai.saas) {
          const t = catalog.find((c) => c.slug === slug);
          if (t && !seenSlugs.has(t.slug)) {
            seenSlugs.add(t.slug);
            uniqueMatched.push(t);
          }
        }
        for (const slug of ai.oss) {
          const s = stacks.find((st) => st.slug === slug);
          if (s && !seenOSSSlugs.has(s.slug) && !seenSlugs.has(s.slug)) {
            seenOSSSlugs.add(s.slug);
            uniqueOSS.push(s);
            aiSuggestedOSS.add(s.slug);
          }
        }
        const aiNames = [
          ...uniqueMatched.map((t) => t.name),
          ...uniqueOSS.map((s) => s.name),
        ];
        updateMsg(aiId, {
          thinking: false,
          result: aiNames.length ? aiNames.join(", ") : t("res_no_tools"),
        });
      } catch (e) {
        updateMsg(aiId, {
          thinking: false,
          result: t("res_error", { msg: e.message }),
        });
      }

      if (uniqueMatched.length === 0 && uniqueOSS.length === 0) {
        addMsg({
          role: "ai",
          agent: "Exodus",
          type: "text",
          thinking: false,
          text: t("msg_no_tools_found"),
        });
        setPhase("idle");
        return;
      }
    } else {
      const identifyParts = [];
      if (uniqueMatched.length)
        identifyParts.push(t("res_saas_count", { n: uniqueMatched.length }));
      if (uniqueOSS.length)
        identifyParts.push(t("res_oss_count", { n: uniqueOSS.length }));
      const allNames = [
        ...uniqueMatched.map((t) => t.name),
        ...uniqueOSS.map((s) => s.name),
      ];
      updateMsg(identifyId, {
        thinking: false,
        result: `${identifyParts.join(" + ")} — ${allNames.join(", ")}`,
      });
    }

    // ── Handle open-source tools ──
    const newSelections = {};
    const aiRecommendedList = [];
    for (const oss of uniqueOSS) {
      if (aiSuggestedOSS.has(oss.slug)) {
        aiRecommendedList.push(oss);
      } else {
        // User explicitly mentioned this OSS tool — "already open-source"
        await delay(400);
        const ossId = addMsg({
          role: "ai",
          agent: "Exodus",
          type: "oss-already",
          thinking: t("thk_checking"),
          stack: oss,
          replacesNames: (oss.alternativeTo ?? []).map(saasDisplayName),
        });
        await delay(400);
        updateMsg(ossId, { thinking: false });
      }
    }

    // Show AI-recommended OSS tools as a HITL choice
    const newPendingHITL = [];
    if (aiRecommendedList.length === 1) {
      // Single recommendation — auto-select
      const oss = aiRecommendedList[0];
      newSelections[oss.slug] = { ...oss, recommended: true };
      await delay(400);
      const recId = addMsg({
        role: "ai",
        agent: "Exodus",
        type: "auto-select",
        thinking: t("thk_selecting"),
        saasSlug: oss.slug,
        saasName: null,
        stack: oss,
        isStrong: (oss.stars ?? 0) >= STRONG_THRESHOLD,
        recommended: true,
      });
      await delay(400);
      updateMsg(recId, { thinking: false });
    } else if (aiRecommendedList.length > 1) {
      // Multiple recommendations — let the user choose
      await delay(400);
      newPendingHITL.push("_ai_recommend");
      addMsg({
        role: "ai",
        agent: "Exodus",
        type: "hitl-recommend",
        thinking: t("thk_waiting_choice"),
        candidates: aiRecommendedList,
      });
    }

    // ── Handle SaaS tools (need alternatives) ──

    // Collect OSS slugs already selected (AI recommendations) to avoid duplicates
    const alreadySelectedSlugs = new Set(
      Object.values(newSelections).map((s) => s.slug),
    );
    // Also include AI recommendation candidates (user may select them via HITL)
    for (const c of aiRecommendedList) alreadySelectedSlugs.add(c.slug);

    for (const tool of uniqueMatched) {
      await delay(400);

      const matchId = addMsg({
        type: "tool-use",
        tool: "match_alternative",
        input: tool.name,
        thinking: true,
      });
      await delay(600);

      const candidates = findAlternatives(tool.slug);
      const strongCandidates = candidates.filter(
        (c) => (c.stars ?? 0) >= STRONG_THRESHOLD,
      );

      // Skip if the best alternative is already recommended by AI
      const best = strongCandidates[0] || candidates[0];
      if (best && alreadySelectedSlugs.has(best.slug)) {
        updateMsg(matchId, {
          thinking: false,
          result: t("res_already_recommended", { name: best.name }),
        });
        continue;
      }

      if (candidates.length === 0) {
        updateMsg(matchId, {
          thinking: false,
          result: t("res_no_match_catalog"),
        });
      } else if (strongCandidates.length <= 1) {
        newSelections[tool.slug] = best;
        alreadySelectedSlugs.add(best.slug);
        updateMsg(matchId, {
          thinking: false,
          result: `${best.name} ★${((best.stars ?? 0) / 1000).toFixed(0)}k`,
        });
        const autoId = addMsg({
          role: "ai",
          agent: "Exodus",
          type: "auto-select",
          thinking: t("thk_selecting"),
          saasSlug: tool.slug,
          saasName: tool.name,
          stack: best,
          isStrong: (best.stars ?? 0) >= STRONG_THRESHOLD,
        });
        await delay(400);
        updateMsg(autoId, { thinking: false });
      } else {
        // Filter out candidates already recommended by AI
        const filteredCandidates = strongCandidates.filter(
          (c) => !alreadySelectedSlugs.has(c.slug),
        );
        if (filteredCandidates.length === 0) {
          updateMsg(matchId, {
            thinking: false,
            result: t("res_already_recommended", {
              name: strongCandidates[0].name,
            }),
          });
          continue;
        }
        updateMsg(matchId, {
          thinking: false,
          result: t("res_user_decides", {
            n: filteredCandidates.length,
          }),
        });
        newPendingHITL.push(tool.slug);
        addMsg({
          role: "ai",
          agent: "Exodus",
          type: "hitl",
          thinking: t("thk_waiting_choice"),
          saasSlug: tool.slug,
          saasName: tool.name,
          candidates: filteredCandidates,
        });
      }
    }

    setSelections(newSelections);
    selectionsRef.current = newSelections;
    setPendingHITL(newPendingHITL);

    if (newPendingHITL.length > 0) {
      setPhase("hitl");
    } else if (Object.keys(newSelections).length > 0) {
      await delay(400);
      proceedToFetch(newSelections);
    } else if (uniqueOSS.length > 0) {
      // Only OSS tools were found — nothing to replace
      addMsg({
        role: "ai",
        agent: "Exodus",
        type: "text",
        thinking: false,
        text: t("msg_all_oss"),
      });
      setPhase("idle");
    }
  };

  // ── Submit handler ──
  const handleSubmit = (text) => {
    runAgent(text);
  };

  // ── Render a single message ──
  const renderMessage = (msg) => {
    switch (msg.type) {
      case "tool-use": {
        const def = AGENT_TOOLS[msg.tool] || {};
        return (
          <div
            key={msg.id}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[13px] font-mono text-[#8a8a96] mr-auto mb-1"
            style={{ animation: "bubble-in 150ms ease-out both" }}
          >
            <span className="text-sm shrink-0 w-[18px] text-center">
              {msg.thinking ? (
                <span
                  className="inline-block text-sm text-cyan-300"
                  style={{ animation: "tool-spin 1s linear infinite" }}
                >
                  ⟳
                </span>
              ) : (
                def.icon || "🔧"
              )}
            </span>
            <code className="font-semibold text-[#c9c9d4] text-[13px] bg-transparent p-0">
              {I18N.en[`tool_${msg.tool}`]
                ? t(`tool_${msg.tool}`)
                : def.label || msg.tool}
            </code>
            {msg.input && (
              <span className="opacity-50 text-xs whitespace-nowrap overflow-hidden text-ellipsis">
                {msg.input.length > 40
                  ? msg.input.slice(0, 37) + "…"
                  : msg.input}
              </span>
            )}
            {!msg.thinking && msg.result && (
              <span className="ml-auto text-xs text-cyan-300 whitespace-nowrap">
                → {msg.result}
              </span>
            )}
          </div>
        );
      }

      case "text":
        return (
          <ChatBubble
            key={msg.id}
            icon={msg.agent === "Exodus" ? "⏏" : undefined}
            role={msg.role}
            agent={msg.agent}
            thinking={msg.thinking}
          >
            {msg.text && renderMarkdown(msg.text)}
          </ChatBubble>
        );

      case "oss-already":
        return (
          <ChatBubble
            key={msg.id}
            role="ai"
            agent="Exodus"
            thinking={msg.thinking}
          >
            <div className="flex items-start gap-3">
              <SiImg
                name={msg.stack.name}
                style={{
                  filter: "var(--pui-logo-filter)",
                  width: 28,
                  height: 28,
                  borderRadius: 6,
                  marginTop: 2,
                }}
              />
              <div>
                <p style={{ margin: "0 0 4px" }}>
                  {tx("oss_already", {
                    name: <strong>{msg.stack.name}</strong>,
                    green: (
                      <span style={{ color: "#22c55e", fontWeight: 600 }}>
                        {t("oss_already_green")}
                      </span>
                    ),
                  })}
                </p>
                <p
                  style={{
                    margin: "0 0 2px",
                    fontSize: "0.85rem",
                    color: "#a8a8b3",
                  }}
                >
                  {msg.stack.description}
                </p>
                <span style={{ fontSize: "0.8rem", color: "#a8a8b3" }}>
                  {t("stars_license", {
                    stars: (msg.stack.stars ?? 0).toLocaleString(),
                    license: msg.stack.license,
                  })}
                  {msg.replacesNames?.length > 0 && (
                    <>
                      {t("replaces_suffix", {
                        names: msg.replacesNames.join(", "),
                      })}
                    </>
                  )}
                </span>
              </div>
            </div>
          </ChatBubble>
        );

      case "web-results":
        return (
          <ChatBubble
            key={msg.id}
            role="ai"
            agent="Exodus"
            thinking={msg.thinking}
          >
            <p style={{ margin: "0 0 12px" }}>
              {tx("web_results_intro", {
                name: <strong>{msg.stackName}</strong>,
              })}
            </p>
            {msg.results.length === 0 ? (
              <p style={{ margin: 0, color: "#a8a8b3" }}>
                {t("web_no_results")}
              </p>
            ) : (
              <div className="flex flex-col gap-2">
                {msg.results.map((r) => (
                  <a
                    key={r.url}
                    href={r.url}
                    target="_blank"
                    rel="noopener"
                    className="block px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] no-underline transition-colors hover:bg-white/[0.06]"
                  >
                    <div className="flex items-baseline gap-2">
                      <strong className="text-[#e7e7ea] text-sm">
                        {r.title || r.url}
                      </strong>
                      <span className="text-xs text-[#8a8a96] font-mono shrink-0 ml-auto">
                        {(() => {
                          try {
                            return new URL(r.url).hostname.replace(
                              /^www\./,
                              "",
                            );
                          } catch {
                            return "";
                          }
                        })()}
                      </span>
                    </div>
                    {r.text && (
                      <p className="text-[0.8rem] text-[#a8a8b3] m-0 mt-1">
                        {r.text.length > 220
                          ? r.text.slice(0, 217) + "…"
                          : r.text}
                      </p>
                    )}
                  </a>
                ))}
              </div>
            )}
            <p className="text-[0.7rem] text-[#5a5a66] m-0 mt-2">
              {t("web_powered")}
            </p>
          </ChatBubble>
        );

      case "auto-select":
        return (
          <ChatBubble
            key={msg.id}
            role="ai"
            agent="Exodus"
            thinking={msg.thinking}
          >
            <p style={{ margin: "0 0 12px" }}>
              {msg.saasName
                ? tx("autosel_for", {
                    saas: <strong>{msg.saasName}</strong>,
                  })
                : t("autosel_plain")}
            </p>
            <GlassCard>
              <GlassCard.Icon>
                <SiImg
                  name={msg.stack.name}
                  style={{ width: 32, height: 32, borderRadius: 6 }}
                />
              </GlassCard.Icon>
              <GlassCard.Title>{msg.stack.name}</GlassCard.Title>
              <GlassCard.Body>
                {msg.stack.description}
                <br />
                <span style={{ color: "#a8a8b3", fontSize: "0.85rem" }}>
                  {t("stars_license", {
                    stars: (msg.stack.stars ?? 0).toLocaleString(),
                    license: msg.stack.license,
                  })}
                </span>
              </GlassCard.Body>
              <div style={{ display: "flex", gap: 16 }}>
                <button
                  onClick={() =>
                    setDetailPopover({
                      slug: msg.stack.slug,
                      name: msg.stack.name,
                      link: msg.stack.link,
                    })
                  }
                  style={{
                    fontSize: "0.85rem",
                    color: "#8a8a96",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 0 0",
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                    textAlign: "left",
                  }}
                >
                  {t("view_on_stacklol")}
                </button>
                <button
                  onClick={() => handleWebSearch(msg.stack)}
                  disabled={searchingSlugs.has(msg.stack.slug)}
                  style={{
                    fontSize: "0.85rem",
                    color: "#8a8a96",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 0 0",
                    textDecoration: "underline",
                    textUnderlineOffset: "2px",
                    textAlign: "left",
                  }}
                >
                  {searchingSlugs.has(msg.stack.slug)
                    ? t("searching_btn")
                    : t("search_web_btn")}
                </button>
              </div>
            </GlassCard>
            <p
              style={{
                margin: "8px 0 0",
                color: "#22c55e",
                fontSize: "0.9rem",
              }}
            >
              {msg.recommended
                ? t("autosel_ready")
                : msg.isStrong
                  ? t("autosel_selected_strong")
                  : t("autosel_selected_best")}
            </p>
          </ChatBubble>
        );

      case "hitl":
        return (
          <ChatBubble
            key={msg.id}
            role="ai"
            agent="Exodus"
            thinking={msg.thinking}
          >
            <p style={{ margin: "0 0 12px" }}>
              {tx("hitl_msg", {
                alts: (
                  <GradientText>
                    {t("hitl_alts", { n: msg.candidates.length })}
                  </GradientText>
                ),
                saas: <strong>{msg.saasName}</strong>,
              })}
            </p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 mt-2">
              {msg.candidates.map((c) => {
                const isSelected = selections[msg.saasSlug]?.slug === c.slug;
                return (
                  <div
                    key={c.slug}
                    className="rounded-xl p-4 transition-all duration-200 border"
                    style={{
                      borderColor: isSelected
                        ? "color-mix(in srgb, var(--pui-grad-from) 50%, transparent)"
                        : "rgba(255,255,255,0.08)",
                      background: isSelected
                        ? "color-mix(in srgb, var(--pui-grad-from) 8%, transparent)"
                        : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <strong>{c.name}</strong>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#a8a8b3",
                        }}
                      >
                        ★ {(c.stars ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "#a8a8b3",
                        margin: "4px 0 8px",
                      }}
                    >
                      {c.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <Button
                        variant={
                          !msg.thinking
                            ? "ghost"
                            : isSelected
                              ? "glow"
                              : "shimmer"
                        }
                        size="sm"
                        disabled={!msg.thinking}
                        onClick={() => handleHITLSelect(msg.saasSlug, c)}
                      >
                        {isSelected ? t("selected_btn") : t("select_btn")}
                      </Button>
                      <button
                        onClick={() =>
                          setDetailPopover({
                            slug: c.slug,
                            name: c.name,
                            link: c.link,
                          })
                        }
                        style={{
                          fontSize: "0.8rem",
                          color: "#8a8a96",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          textDecoration: "underline",
                          textUnderlineOffset: "2px",
                        }}
                      >
                        {t("details_btn")}
                      </button>
                      <button
                        onClick={() => handleWebSearch(c)}
                        disabled={searchingSlugs.has(c.slug)}
                        title={t("search_web_title")}
                        style={{
                          fontSize: "0.8rem",
                          color: "#8a8a96",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          textDecoration: "underline",
                          textUnderlineOffset: "2px",
                        }}
                      >
                        {searchingSlugs.has(c.slug)
                          ? t("more_btn_loading")
                          : t("more_btn")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ChatBubble>
        );

      case "hitl-recommend":
        return (
          <ChatBubble
            key={msg.id}
            role="ai"
            agent="Exodus"
            thinking={msg.thinking}
          >
            <p style={{ margin: "0 0 12px" }}>
              {tx("hitlrec_msg", {
                tools: (
                  <GradientText>
                    {t("hitlrec_tools", { n: msg.candidates.length })}
                  </GradientText>
                ),
              })}
            </p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3 mt-2">
              {msg.candidates.map((c) => {
                const isSelected = !!selections[c.slug]?.recommended;
                return (
                  <div
                    key={c.slug}
                    className="rounded-xl p-4 transition-all duration-200 border"
                    style={{
                      borderColor: isSelected
                        ? "color-mix(in srgb, var(--pui-grad-from) 50%, transparent)"
                        : "rgba(255,255,255,0.08)",
                      background: isSelected
                        ? "color-mix(in srgb, var(--pui-grad-from) 8%, transparent)"
                        : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <strong>{c.name}</strong>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#a8a8b3",
                        }}
                      >
                        ★ {(c.stars ?? 0).toLocaleString()}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "#a8a8b3",
                        margin: "4px 0 8px",
                      }}
                    >
                      {c.description}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <Button
                        variant={
                          !msg.thinking
                            ? "ghost"
                            : isSelected
                              ? "glow"
                              : "shimmer"
                        }
                        size="sm"
                        disabled={!msg.thinking}
                        onClick={() => handleRecommendToggle(c.slug, c)}
                      >
                        {isSelected ? t("selected_btn") : t("select_btn")}
                      </Button>
                      <button
                        onClick={() =>
                          setDetailPopover({
                            slug: c.slug,
                            name: c.name,
                            link: c.link,
                          })
                        }
                        style={{
                          fontSize: "0.8rem",
                          color: "#8a8a96",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          textDecoration: "underline",
                          textUnderlineOffset: "2px",
                        }}
                      >
                        {t("details_btn")}
                      </button>
                      <button
                        onClick={() => handleWebSearch(c)}
                        disabled={searchingSlugs.has(c.slug)}
                        title={t("search_web_title")}
                        style={{
                          fontSize: "0.8rem",
                          color: "#8a8a96",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          textDecoration: "underline",
                          textUnderlineOffset: "2px",
                        }}
                      >
                        {searchingSlugs.has(c.slug)
                          ? t("more_btn_loading")
                          : t("more_btn")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            {msg.thinking && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: 16,
                }}
              >
                <Button
                  variant="glow"
                  size="sm"
                  disabled={
                    !Object.values(selections).some((s) => s.recommended)
                  }
                  onClick={handleRecommendConfirm}
                >
                  {t("confirm_selection")}
                </Button>
              </div>
            )}
          </ChatBubble>
        );

      case "recipe": {
        const ready = !msg.thinking;
        return (
          <ChatBubble
            key={msg.id}
            role="ai"
            agent="Exodus"
            thinking={msg.thinking}
          >
            {ready && (
              <p style={{ margin: "0 0 16px" }}>
                <GradientText>{t("recipe_ready")}</GradientText>
              </p>
            )}

            <div className="flex flex-col gap-1 mb-4 font-mono text-sm">
              {Object.entries(msg.allSelections).map(([saasSlug, stack]) => {
                const status = runProgress[stack.slug];
                const dotColor =
                  status === "live"
                    ? "#22c55e"
                    : status === "running"
                      ? "#f59e0b"
                      : "#8a8a96";
                return (
                  <div
                    key={saasSlug}
                    className="grid grid-cols-[1.2fr_1.5fr_0.8fr] items-center gap-3 px-3 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg"
                  >
                    <span className="font-semibold text-white flex items-center gap-2">
                      <StatusDot
                        color={dotColor}
                        static={!status || status === "live"}
                      />{" "}
                      {stack.name}
                    </span>
                    <span className="text-[#a8a8b3]">
                      {stack.recommended
                        ? stack.description
                        : t("recipe_replaces", {
                            name: saasDisplayName(saasSlug),
                          })}
                    </span>
                    {status === "live" && (
                      <button
                        onClick={() =>
                          setServicePopover({
                            slug: stack.slug,
                            name: stack.name,
                            domain: `${stack.slug}.stack.localhost`,
                          })
                        }
                        className="text-xs text-cyan-300 bg-transparent border-none cursor-pointer p-0 underline underline-offset-2 font-mono text-right"
                      >
                        {t("open_btn")}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {ready && (
              <>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: 20,
                    marginBottom: 8,
                    gap: 16,
                  }}
                >
                  <Button
                    variant="ghost"
                    loading={isRunning}
                    onClick={() => handleRunAll(msg.allSelections)}
                  >
                    {t("run_locally")}
                  </Button>

                  <Button
                    variant="glow"
                    loading={isDeploying}
                    onClick={() =>
                      handlePayAndDeploy(msg.allSelections, msg.files)
                    }
                  >
                    <SiImg
                      name="icloud"
                      className="inline-flex w-4 align-middle mr-2"
                    />
                    {t("deploy_cloud")}
                  </Button>
                </div>

                {/* <div className="flex justify-center items-center gap-1.5 flex-wrap">*/}
                {/* <button
                    className="text-xs text-[#8a8a96] bg-transparent border-none cursor-pointer px-1.5 py-1 underline underline-offset-2 font-[inherit]"
                    onClick={() => downloadCompose(msg.files)}
                  >
                    ↓ compose.yaml
                  </button>
                  <button
                    className="text-xs text-[#8a8a96] bg-transparent border-none cursor-pointer px-1.5 py-1 underline underline-offset-2 font-[inherit]"
                    onClick={() => downloadEnv(msg.files)}
                  >
                    ↓ .env
                  </button>*/}
                {/* </div>*/}
              </>
            )}
          </ChatBubble>
        );
      }

      case "run-progress":
        return (
          <ChatBubble
            key={msg.id}
            role="ai"
            agent="Exodus"
            thinking={msg.thinking}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {msg.slugs.map((slug) => {
                const status = runProgress[slug] ?? "pending";
                const color =
                  status === "live"
                    ? "#22c55e"
                    : status === "error"
                      ? "#ef4444"
                      : status === "running"
                        ? "#f59e0b"
                        : "#8a8a96";
                const label =
                  status === "live"
                    ? t("status_live")
                    : status === "error"
                      ? t("status_error")
                      : status === "running"
                        ? t("status_starting")
                        : t("status_pending");
                return (
                  <div key={slug}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: "0.9rem",
                      }}
                    >
                      <StatusDot
                        color={color}
                        static={status === "live" || status === "error"}
                      />
                      <strong>{slug}</strong>
                      <span
                        style={{
                          color,
                          fontSize: "0.8rem",
                          marginLeft: "auto",
                        }}
                      >
                        {label}
                      </span>
                      {status === "live" && (
                        <button
                          onClick={() =>
                            setServicePopover({
                              slug,
                              name: slug,
                              domain: `${slug}.stack.localhost`,
                            })
                          }
                          className="text-[0.75rem] text-cyan-300 bg-transparent border-none cursor-pointer p-0 underline underline-offset-2 font-mono text-right"
                        >
                          {t("open_btn")}
                        </button>
                      )}
                    </div>
                    {msg.logs?.[slug] && (
                      <pre className="text-[0.7rem] overflow-auto max-h-[80px] p-3 m-0 mt-1 bg-black/30 text-[#a8a8b3] whitespace-pre-wrap break-all">
                        {msg.logs[slug]}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          </ChatBubble>
        );

      case "cloud-deploy": {
        const allHealthy =
          msg.deployments?.length > 0 &&
          msg.deployments.every(
            (d) => (msg.services || []).find((s) => s.slug === d.slug)?.healthy,
          );
        return (
          <ChatBubble
            key={msg.id}
            role="ai"
            agent="Exodus"
            thinking={msg.thinking}
          >
            {msg.error && (
              <p style={{ color: "#ef4444", margin: "0 0 8px" }}>
                ⚠ {msg.error}
              </p>
            )}

            {allHealthy && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  margin: "0 0 16px",
                  flexWrap: "wrap",
                }}
              >
                <GradientText>{t("cloud_live")}</GradientText>
                <CountdownBadge expiresAt={msg.expiresAt} />
              </div>
            )}

            {msg.deployments?.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {msg.deployments.map((d) => {
                  const svc = (msg.services || []).find(
                    (s) => s.slug === d.slug,
                  );
                  const healthy = svc?.healthy;
                  return (
                    <div
                      key={d.slug}
                      style={{
                        padding: "12px 16px",
                        background: healthy
                          ? "rgba(34,197,94,0.06)"
                          : "rgba(255,255,255,0.03)",
                        border: `1px solid ${healthy ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <StatusDot
                          color={healthy ? "#22c55e" : "#f59e0b"}
                          static={healthy}
                        />
                        <strong>{d.name}</strong>
                        {!healthy && (
                          <span
                            style={{
                              marginLeft: "auto",
                              color: "#8a8a96",
                              fontSize: "0.8rem",
                            }}
                          >
                            {t("status_deploying")}
                          </span>
                        )}
                      </div>
                      {healthy && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            marginTop: 10,
                          }}
                        >
                          <Button
                            variant="glow"
                            size="sm"
                            onClick={() => {
                              try {
                                const host = new URL(d.url).hostname;
                                setServicePopover({
                                  slug: d.slug,
                                  name: d.name,
                                  domain: host,
                                });
                              } catch {
                                window.open(d.url, "_blank");
                              }
                            }}
                          >
                            {t("preview_btn", { name: d.name })}
                          </Button>
                          <Button
                            variant="glow"
                            size="sm"
                            as="a"
                            href={d.url}
                            target="_blank"
                          >
                            {t("open_name_btn", { name: d.name })}
                          </Button>
                          <a
                            href={d.url}
                            target="_blank"
                            rel="noopener"
                            style={{
                              color: "#8a8a96",
                              fontSize: "0.8rem",
                              fontFamily:
                                "JetBrains Mono, ui-monospace, monospace",
                            }}
                          >
                            {d.url.replace("https://", "")}
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ChatBubble>
        );
      }

      default:
        return null;
    }
  };

  // ── Minimal markdown (bold only) ──
  const renderMarkdown = (text) => {
    const html = marked.parseInline(text);
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // ── Render ──
  return (
    <div className="font-sans text-[#e7e7ea] bg-[#0a0a0f] min-h-screen">
      {/* ─── Announcement bar ─── */}
      <StickyBanner
        hideSparkle
        trailing={<a href="https://superai.com">{t("banner_cta")}</a>}
      >
        {tx("banner_text", {
          solo: <a href="https://github.com/arnaud">{t("banner_solo")}</a>,
        })}
      </StickyBanner>

      {/* ─── Hero ─── */}
      <section style={{ position: "relative", overflow: "hidden" }}>
        <Aurora animated />
        <div className="relative z-10 max-w-[1100px] mx-auto px-6 pt-4 pb-0 -mb-4 flex items-center justify-between">
          <h1 className="text-[1.4rem] leading-tight font-medium">
            <a href=".">
              <Sparkle static solid glyph="⏏" /> Exodus
            </a>
          </h1>
          <LangSwitcher lang={lang} onChange={changeLang} />
        </div>

        <div className="pt-[120px] pb-[120px] -mb-8" id="picker">
          <div className="relative max-w-[760px] mx-auto text-center flex flex-col items-center gap-6">
            <h1
              className="font-extrabold leading-tight m-0 whitespace-nowrap"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)" }}
            >
              {tx("hero_title", {
                tool: (
                  <GradientText>
                    <Rotator
                      key={catalog.length > 0 ? "catalog" : "static"}
                      words={(() => {
                        if (catalog.length === 0) {
                          // Initial static list before catalog loads
                          return [
                            "Notion",
                            "Linear",
                            "Datadog",
                            "Slack",
                            "Google Drive",
                          ];
                        }
                        // Top 12 SaaS tools by total stars of their alternatives
                        const saasStars = {};
                        for (const s of stacks) {
                          for (const a of s.alternativeTo ?? []) {
                            if (EXCLUDED_SAAS.has(a)) continue;
                            saasStars[a] = (saasStars[a] ?? 0) + (s.stars ?? 0);
                          }
                        }
                        return Object.entries(saasStars)
                          .sort((a, b) => b[1] - a[1])
                          .slice(0, 24)
                          .sort(() => Math.random() - 0.5)
                          .map(([slug]) => saasDisplayName(slug));
                      })()}
                      gradient
                    />
                  </GradientText>
                ),
              })}
            </h1>

            <p className="text-lg leading-relaxed text-[#a8a8b3] max-w-[640px] mx-auto">
              {tx("hero_sub", {
                oss: <strong>{t("hero_sub_oss")}</strong>,
                cloud: <strong>{t("hero_sub_cloud")}</strong>,
              })}
            </p>

            <HighlightedPrompt
              key={lang}
              catalog={catalog}
              stacks={stacks}
              placeholder={t("prompt_placeholder")}
              ctaLabel={t("prompt_cta")}
              onSubmit={handleSubmit}
            />

            {/* <p className="text-[0.95rem] text-[#8a8a96]">
              {catalog.length > 0 && (
                <>
                  {catalog.length} SaaS tools recognized · {stacks.length}{" "}
                  open-source alternatives in the catalog
                </>
              )}
            </p>*/}
          </div>
        </div>
      </section>

      {/* ─── Conversation ─── */}
      {messages.length > 0 && (
        <section
          className="max-w-[1100px] mx-auto px-6 py-20"
          id="conversation"
        >
          {/* <div className="text-center max-w-[720px] mx-auto mb-12 flex flex-col items-center gap-2">
            <EyebrowPill>Agent conversation</EyebrowPill>
          </div>*/}

          <div
            className="flex flex-col gap-4 max-w-[780px] mx-auto"
            ref={convoRef}
          >
            {messages.map(renderMessage)}

            {/* HITL status bar */}
            {phase === "hitl" && pendingHITL.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-3 bg-amber-500/[0.08] border border-amber-500/25 rounded-[10px] text-sm text-amber-400">
                <Sparkle />
                <span>
                  {tx("hitl_waiting_bar", {
                    names: (
                      <strong>
                        {pendingHITL.map((s) => saasDisplayName(s)).join(", ")}
                      </strong>
                    ),
                  })}
                </span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ─── Social proof ─── */}
      <section className="max-w-[1100px] mx-auto px-6 py-20">
        <p className="text-center text-[#8a8a96] mb-4">{t("social_proof")}</p>
        <LogoMarquee
          pauseOnHover
          speed={90}
          logos={(() => {
            // Top 30 SaaS tools by total stars of their OSS alternatives
            const saasStars = {};
            for (const s of stacks) {
              for (const a of s.alternativeTo ?? []) {
                if (EXCLUDED_SAAS.has(a)) continue;
                saasStars[a] = (saasStars[a] ?? 0) + (s.stars ?? 0);
              }
            }
            return Object.entries(saasStars)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 24)
              .map(([slug]) => {
                const name = saasDisplayName(slug);
                return {
                  kind: "node",
                  node: (
                    <span className="text-xl font-bold text-[#c9c9d4] whitespace-nowrap">
                      <SiImg
                        name={slug}
                        title={name}
                        className="inline-flex w-1 h-1 mr-2"
                      />
                      {name}
                    </span>
                  ),
                  key: slug,
                };
              });
          })()}
        />
      </section>

      {/* ─── Why ─── */}
      <section className="max-w-[1100px] mx-auto px-6 py-20" id="why">
        <div className="text-center max-w-[720px] mx-auto mb-12 flex flex-col items-center gap-2">
          <EyebrowPill icon={false}>{t("why_eyebrow")}</EyebrowPill>
          <h2
            className="font-bold leading-tight mt-3"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)" }}
          >
            {tx("why_title", {
              grad: <GradientText>{t("why_title_grad")}</GradientText>,
            })}
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          <GlassCard breathing glowOnHover>
            <GlassCard.Icon>🏛️</GlassCard.Icon>
            <GlassCard.Title>{t("why1_title")}</GlassCard.Title>
            <GlassCard.Body>{t("why1_body")}</GlassCard.Body>
          </GlassCard>

          <GlassCard breathing glowOnHover>
            <GlassCard.Icon>🔓</GlassCard.Icon>
            <GlassCard.Title>{t("why2_title")}</GlassCard.Title>
            <GlassCard.Body>{t("why2_body")}</GlassCard.Body>
          </GlassCard>

          <GlassCard breathing glowOnHover>
            <GlassCard.Icon>📉</GlassCard.Icon>
            <GlassCard.Title>{t("why3_title")}</GlassCard.Title>
            <GlassCard.Body>{t("why3_body")}</GlassCard.Body>
          </GlassCard>
        </div>
        <br />

        <BeforeAfter
          brand="Exodus"
          beforeLabel={t("ba_before_label")}
          afterLabel={t("ba_after_label")}
          before={[
            t("ba_before_1"),
            t("ba_before_2"),
            t("ba_before_3"),
            t("ba_before_4"),
          ]}
          after={[
            t("ba_after_1"),
            t("ba_after_2"),
            t("ba_after_3"),
            t("ba_after_4"),
          ]}
        />
      </section>

      {/* ─── How it works ─── */}
      <section className="max-w-[1100px] mx-auto px-6 py-20" id="how-it-works">
        <div className="text-center max-w-[720px] mx-auto mb-12 flex flex-col items-center gap-2">
          <EyebrowPill icon={false}>{t("how_eyebrow")}</EyebrowPill>
          <h2
            className="font-bold leading-tight mt-3"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)" }}
          >
            {tx("how_title", {
              grad: <GradientText>{t("how_title_grad")}</GradientText>,
            })}
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          <GlassCard breathing glowOnHover data-numbering="1">
            <GlassCard.Title>{t("how1_title")}</GlassCard.Title>
            <GlassCard.Body>
              {t("how1_body", {
                count: 10 * Math.floor(catalog.length / 10) || "100",
              })}
            </GlassCard.Body>
            <GlassCard.Link href="#picker">{t("how1_link")}</GlassCard.Link>
          </GlassCard>

          <GlassCard breathing glowOnHover data-numbering="2">
            <GlassCard.Title>{t("how2_title")}</GlassCard.Title>
            <GlassCard.Body>
              {tx("how2_body", {
                you: <strong>{t("how2_you")}</strong>,
              })}
            </GlassCard.Body>
          </GlassCard>

          <GlassCard breathing glowOnHover data-numbering="3">
            <GlassCard.Title>{t("how3_title")}</GlassCard.Title>
            <GlassCard.Body>{t("how3_body")}</GlassCard.Body>
          </GlassCard>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="max-w-[1100px] mx-auto px-6 py-20" id="features">
        <div className="text-center max-w-[720px] mx-auto mb-12 flex flex-col items-center gap-2">
          <EyebrowPill icon={false}>{t("feat_eyebrow")}</EyebrowPill>
          <h2
            className="font-bold leading-tight mt-3"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)" }}
          >
            {tx("feat_title", {
              grad: <GradientText>{t("feat_title_grad")}</GradientText>,
            })}
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-6">
          <GlassCard breathing glowOnHover>
            <GlassCard.Icon>
              <SiImg name="apachearrow" className="w-5" />
            </GlassCard.Icon>
            <GlassCard.Title>
              {t("feat1_title", { count: approxStackCount })}
            </GlassCard.Title>
            <GlassCard.Body>{t("feat1_body")}</GlassCard.Body>
          </GlassCard>

          <GlassCard breathing glowOnHover>
            <GlassCard.Icon>
              <SiImg name="ticktick" className="w-5" />
            </GlassCard.Icon>
            <GlassCard.Title>{t("feat2_title")}</GlassCard.Title>
            <GlassCard.Body>{t("feat2_body")}</GlassCard.Body>
          </GlassCard>

          <GlassCard breathing glowOnHover>
            <GlassCard.Icon>
              <SiImg name="iCloud" className="w-5" />
            </GlassCard.Icon>
            <GlassCard.Title>{t("feat3_title")}</GlassCard.Title>
            <GlassCard.Body>{t("feat3_body")}</GlassCard.Body>
          </GlassCard>

          <GlassCard breathing glowOnHover>
            <GlassCard.Icon>
              <SiImg name="Docker" className="w-5" />
            </GlassCard.Icon>
            <GlassCard.Title>{t("feat4_title")}</GlassCard.Title>
            <GlassCard.Body>
              {tx("feat4_body", {
                compose: <code>compose.yaml</code>,
                env: <code>.env</code>,
                cmd: <code>docker compose up</code>,
              })}
            </GlassCard.Body>
          </GlassCard>

          <GlassCard breathing glowOnHover>
            <GlassCard.Icon>🔒</GlassCard.Icon>
            <GlassCard.Title>{t("feat5_title")}</GlassCard.Title>
            <GlassCard.Body>{t("feat5_body")}</GlassCard.Body>
          </GlassCard>

          <GlassCard breathing glowOnHover>
            <GlassCard.Icon>👀</GlassCard.Icon>
            <GlassCard.Title>{t("feat6_title")}</GlassCard.Title>
            <GlassCard.Body>{t("feat6_body")}</GlassCard.Body>
          </GlassCard>
        </div>
      </section>

      {/* ─── Pricing ─── */}
      <section className="max-w-[1100px] mx-auto px-6 py-20" id="pricing">
        <div className="text-center max-w-[720px] mx-auto mb-12 flex flex-col items-center gap-2">
          <EyebrowPill icon={false}>{t("pricing_eyebrow")}</EyebrowPill>
          <h2
            className="font-bold leading-tight mt-3"
            style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)" }}
          >
            {tx("pricing_title", {
              grad: <GradientText>{t("pricing_title_grad")}</GradientText>,
            })}
          </h2>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6 items-start">
          <PricingCard>
            <PricingCard.Tier>{t("price1_tier")}</PricingCard.Tier>
            <PricingCard.Amount>{t("price1_amount")}</PricingCard.Amount>
            <PricingCard.Blurb>{t("price1_blurb")}</PricingCard.Blurb>
            <PricingCard.Features>
              <li>{t("price1_f1")}</li>
              <li>{t("price1_f2")}</li>
              <li>{t("price1_f3")}</li>
            </PricingCard.Features>
            <PricingCard.CTA href="#picker">{t("get_started")}</PricingCard.CTA>
          </PricingCard>

          <PricingCard featured>
            <PricingCard.Flag hideSparkle>{t("price2_flag")}</PricingCard.Flag>
            <PricingCard.Tier>{t("price2_tier")}</PricingCard.Tier>
            <PricingCard.Amount unit={t("price2_unit")}>$1</PricingCard.Amount>
            <PricingCard.Blurb>{t("price2_blurb")}</PricingCard.Blurb>
            <PricingCard.Features>
              <li>{t("price2_f1")}</li>
              <li>{t("price2_f2")}</li>
              <li>{t("price2_f3")}</li>
            </PricingCard.Features>
            <PricingCard.CTA href="#picker">{t("get_started")}</PricingCard.CTA>
          </PricingCard>

          <PricingCard>
            <PricingCard.Flag hideSparkle>{t("price3_flag")}</PricingCard.Flag>
            <PricingCard.Tier>{t("price3_tier")}</PricingCard.Tier>
            <PricingCard.Amount unit={t("price3_unit")}>$99</PricingCard.Amount>
            <PricingCard.Blurb>{t("price3_blurb")}</PricingCard.Blurb>
            <PricingCard.Features>
              <li>{t("price3_f1")}</li>
              <li>{t("price3_f2")}</li>
              <li>{t("price3_f3")}</li>
            </PricingCard.Features>
            <PricingCard.CTA href="mailto:arnaud@codename.co?subject=Exodus%20-%20Fully%20managed%20plan">
              {t("contact_us")}
            </PricingCard.CTA>
          </PricingCard>
        </div>
      </section>

      {/* ─── Closer ─── */}
      <section className="relative overflow-hidden text-center flex flex-col items-center gap-8 pt-[100px] pb-[140px]">
        <Aurora
          blobs={[{ color: "rgba(124,58,237,0.55)", x: 50, y: 90, size: 60 }]}
        />
        <h2
          className="font-bold leading-tight mt-3"
          style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)" }}
        >
          {t("closer_1")}
          <br />
          <GradientText>{t("closer_2")}</GradientText>
        </h2>
        <Button variant="glow" size="lg" sparkle as="a" href="#picker">
          {t("closer_cta")}
        </Button>
      </section>

      {/* ─── Footer ─── */}
      <footer className="px-6 pt-16 pb-8 max-w-[1100px] mx-auto">
        <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr] gap-8 mb-12">
          {/* Brand column */}
          <div className="flex flex-col gap-2">
            <p className="text-xl font-extrabold m-0">
              <Sparkle static solid glyph="⏏" /> Exodus
            </p>
            <p className="text-sm text-[#5a5a66] m-0">{t("footer_tagline")}</p>
          </div>

          {/* Navigation column */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold text-[#e7e7ea] mb-1 uppercase tracking-wide">
              {t("footer_product")}
            </p>
            <a
              href="#picker"
              className="text-sm text-[#8a8a96] no-underline leading-loose"
            >
              {t("prompt_cta")}
            </a>
            <a
              href="#how-it-works"
              className="text-sm text-[#8a8a96] no-underline leading-loose"
            >
              {t("how_eyebrow")}
            </a>
            <a
              href="#why"
              className="text-sm text-[#8a8a96] no-underline leading-loose"
            >
              {t("why_eyebrow")}
            </a>
            <a
              href="#features"
              className="text-sm text-[#8a8a96] no-underline leading-loose"
            >
              {t("feat_eyebrow")}
            </a>
            <a
              href="#pricing"
              className="text-sm text-[#8a8a96] no-underline leading-loose"
            >
              {t("pricing_eyebrow")}
            </a>
          </div>

          {/* Community column */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-bold text-[#e7e7ea] mb-1 uppercase tracking-wide">
              {t("footer_community")}
            </p>
            <a
              href="https://github.com/arnaud/exodus"
              target="_blank"
              className="text-sm text-[#8a8a96] no-underline leading-loose"
            >
              GitHub
            </a>
            <a
              href="https://stack.lol"
              target="_blank"
              className="text-sm text-[#8a8a96] no-underline leading-loose"
            >
              Stack
            </a>
          </div>

          {/* Badges column */}
          <div className="flex flex-col gap-2">
            <CommunityBadge
              icon={siIcon("github")}
              title={t("badge_star")}
              href="https://github.com/arnaud/exodus"
            />
            <CommunityBadge
              icon={siIcon("docker")}
              title={t("feat1_title", { count: approxStackCount })}
              subtitle={t("badge_tested")}
              href="https://stack.lol"
            />
          </div>
        </div>

        <div className="flex justify-between items-center gap-4 border-t border-white/[0.06] pt-6 text-sm text-[#5a5a66]">
          <span>© {new Date().getFullYear()} Exodus</span>
          <LangSwitcher lang={lang} onChange={changeLang} />
          <span className="text-sm text-[#5a5a66] m-0">
            {t("footer_built")}
          </span>
        </div>
      </footer>

      {/* ─── Detail Popover ─── */}
      {detailPopover && (
        <Popover
          open={!!detailPopover}
          onOpenChange={(open) => {
            if (!open) setDetailPopover(null);
          }}
          title={detailPopover.name}
          closeLabel={t("close_label")}
          closeOnEscape
          closeOnBackdrop
        >
          <iframe
            src={`https://stack.lol${detailPopover.link}`}
            style={{
              width: "100%",
              height: "70vh",
              border: "none",
              borderRadius: 8,
              background: "#111",
            }}
            title={`${detailPopover.name} on stack.lol`}
          />
        </Popover>
      )}

      {/* ─── Service Popover ─── */}
      {servicePopover && (
        <Popover
          open={!!servicePopover}
          onOpenChange={(open) => {
            if (!open) setServicePopover(null);
          }}
          title={
            <>
              <SiImg
                name={servicePopover.slug}
                title={servicePopover.name}
                className="inline-flex w-6 h-6 align-middle mr-2"
              />
              {servicePopover.name}
            </>
          }
          closeLabel={t("close_label")}
          closeOnEscape
          closeOnBackdrop
        >
          <iframe
            src={`https://${servicePopover.domain}`}
            style={{
              width: "100%",
              height: "70vh",
              border: "none",
              borderRadius: 8,
              background: "#111",
            }}
            title={`${servicePopover.name} running at ${servicePopover.domain}`}
          />
        </Popover>
      )}
    </div>
  );
}

// ─── Mount ───────────────────────────────────────────────────────────
// Merge the non-English locales before mounting; if the fetch fails,
// the app still works with the embedded English strings.
(async () => {
  try {
    const r = await fetch("./locales.json");
    if (r.ok) Object.assign(I18N, await r.json());
  } catch {}
  currentLang = detectLang();
  createRoot(document.getElementById("root")).render(<App />);
})();
