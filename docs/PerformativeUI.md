# performative-ui

> **AI-native React components that signal how oversubscribed your funding round is.**  
> Tongue firmly in cheek.

- **npm:** `performative-ui`
- **Version:** 0.3.0
- **Bundle:** ~30 KB
- **React:** 18 or 19
- **Docs / live demos:** <https://vorpus.github.io/performativeUI>
- **GitHub:** <https://github.com/vorpus/performativeUI>
- **License:** MIT

---

## Installation

```bash
npm install performative-ui
```

Import the bundled styles once at your app root (or in `main.tsx`):

```ts
import 'performative-ui';        // styles are bundled with the package
// or explicitly:
import 'performative-ui/styles.css';
```

All components are named exports from the single entry point:

```ts
import { Button, Aurora, GlassCard, ChatBubble } from 'performative-ui';
```

---

## Component Catalog

### Atoms

#### `<Sparkle>`

The mandatory ✦. Add liberally to anything that needs to feel AI. Defaults to a twinkling gradient glyph; `solid` keeps it monochrome.

```tsx
<Sparkle />
<Sparkle glyph="✧" solid />
<Sparkle static />          // no animation
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `glyph` | `string` | `"✦"` | Glyph to render |
| `solid` | `boolean` | `false` | Skip gradient fill, render in `currentColor` |
| `static` | `boolean` | `false` | Disable the twinkle animation |

---

#### `<GradientText>`

Text painted with the consensus AI gradient.

```tsx
<GradientText>Reasoning at the speed of thought.</GradientText>
<GradientText as="h1" static>Ship AI products</GradientText>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `as` | `ElementType` | `"span"` | Override the rendered tag |
| `static` | `boolean` | `false` | Still gradient-colored, but no animation |

---

#### `<StatusDot>`

A pulsing colored dot — the universal "we're live!" indicator.

```tsx
<StatusDot />
<StatusDot color="#22c55e" />
<StatusDot static />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `string` | `var(--pui-success)` | CSS color for the dot |
| `static` | `boolean` | `false` | Disable the pulse animation |

---

### Primitives

#### `<Button>`

Polymorphic button with five variants. Pass `as` to render an anchor or routed link.

```tsx
<Button>Default</Button>
<Button variant="glow" sparkle>Generate</Button>
<Button variant="shimmer" size="lg">Ship it</Button>
<Button variant="ghost">Talk to sales</Button>
<Button variant="wave">Edit in Chat</Button>
<Button as="a" href="/x" variant="ghost">Docs</Button>
<Button loading>Generating…</Button>
<Button block>Full-width</Button>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"glow" \| "shimmer" \| "ghost" \| "solid" \| "wave"` | `"glow"` | Visual style |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | |
| `sparkle` | `boolean` | `false` | Render a ✦ to the right of the label |
| `loading` | `boolean` | `false` | Show a spinner and disable the button |
| `block` | `boolean` | `false` | Full-width |
| `as` | `ElementType` | `"button"` | Override the rendered tag |

---

#### `<StickyBanner>`

The sticky announcement bar. Houses funding news, beta tags, and whatever else hasn't shipped yet.

```tsx
<StickyBanner>We just raised our Series A 🎉</StickyBanner>
<StickyBanner trailing={<a href="/blog">Read more →</a>}>
  GPT-5 Turbo Vision is now available
</StickyBanner>
<StickyBanner hideSparkle>Now in public beta</StickyBanner>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hideSparkle` | `boolean` | `false` | Hide the leading ✦ |
| `trailing` | `ReactNode` | — | Optional trailing accessory |

---

#### `<EyebrowPill>`

The mid-page section eyebrow. Houses bullet phrases like "The platform" or "Now with GPT-5.5 Turbo".

```tsx
<EyebrowPill>Now generally available</EyebrowPill>
<EyebrowPill statusColor="#7c3aed">The platform</EyebrowPill>
<EyebrowPill icon={<Sparkle />}>AI-native</EyebrowPill>
<EyebrowPill icon={false}>No icon</EyebrowPill>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `ReactNode \| false` | `<StatusDot />` | Custom icon, or `false` to hide |
| `statusColor` | `string` | — | Status dot color when using the default dot |

---

### Heroes

#### `<Rotator>`

The typewriter rotator. Types each word, holds, deletes, advances, repeats.

```tsx
<Rotator words={['doctors', 'lawyers', 'founders']} />

// Slower typing, faster delete, no cursor
<Rotator
  words={['ship faster', 'reason smarter', 'scale globally']}
  typeMs={90}
  deleteMs={20}
  holdMs={2000}
  hideCursor
/>

// Custom word renderer
<Rotator
  words={['doctors', 'lawyers', 'founders']}
  renderWord={(word) => <GradientText>{word}</GradientText>}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `words` | `string[]` | required | Words to cycle through |
| `typeMs` | `number` | `70` | ms per character while typing |
| `deleteMs` | `number` | `32` | ms per character while deleting |
| `holdMs` | `number` | `1500` | ms to hold the fully typed word |
| `loop` | `boolean` | `true` | Loop after last word |
| `hideCursor` | `boolean` | `false` | Hide the blinking cursor |
| `cursor` | `string` | — | Custom cursor glyph (e.g. `"\|"`) |
| `renderWord` | `(word, index) => ReactNode` | — | Custom word renderer |
| `onWordReached` | `(word, index) => void` | — | Fired when each word finishes typing |

---

#### `<WordRoll>`

Vertical word roll — the active word slides into view, previous one rolls out. No typing.

```tsx
<WordRoll words={["doctors", "lawyers", "founders"]} />

<WordRoll
  words={["ship", "reason", "scale"]}
  gradient
  direction="down"
  intervalMs={2000}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `words` | `string[]` | required | Words to cycle through |
| `intervalMs` | `number` | `2200` | ms each word holds before rolling |
| `transitionMs` | `number` | `500` | ms of the slide animation |
| `direction` | `"up" \| "down"` | `"up"` | Direction words roll in from |
| `gradient` | `boolean` | `false` | Paint each word with the AI gradient |

---

#### `<PromptHero>`

The ChatGPT-box-as-CTA — replace your value proposition with a text input.

```tsx
<PromptHero onSubmit={(text) => navigate(`/build?q=${text}`)} />

<PromptHero
  placeholder="Describe the app you want to build…"
  ctaLabel="Build it"
  leading={false}
  onSubmit={handleSubmit}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `"Describe what you want to build…"` | |
| `defaultValue` | `string` | — | Initial value |
| `value` | `string` | — | Controlled value |
| `onChange` | `(value: string) => void` | — | |
| `onSubmit` | `(value: string) => void` | — | Fires on form submit |
| `leading` | `ReactNode \| false` | `<Sparkle />` | Leading icon |
| `ctaLabel` | `ReactNode` | `"Generate"` | Submit button label |
| `hideCta` | `boolean` | `false` | Hide the trailing CTA |

---

#### `<Prompt>`

The full multi-line prompt box: textarea + toolbar with model dropdown, add-context, voice, and send.

```tsx
<Prompt
  models={["GPT-5", "Claude 4.7", "Gemini 3"]}
  onSubmit={(text, { model }) => generate(text, model)}
/>

// Minimal — no toolbar extras
<Prompt
  placeholder="Build me a…"
  hideAddContext
  hideVoice
  onSubmit={handleSubmit}
/>

// Controlled
<Prompt
  value={text}
  onChange={setText}
  model={model}
  onModelChange={setModel}
  onSubmit={handleSubmit}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` / `defaultValue` | `string` | `""` | Textarea value |
| `onChange` | `(value: string) => void` | — | |
| `onSubmit` | `(value: string, ctx: { model?: string }) => void` | — | |
| `placeholder` | `string` | `"Build me a…"` | |
| `rows` | `number` | `3` | Initial textarea height |
| `models` | `string[]` | 3 defaults | Model options in the dropdown |
| `model` / `defaultModel` | `string` | — | Controlled/uncontrolled selected model |
| `onModelChange` | `(model: string) => void` | — | |
| `onAddContext` | `() => void` | — | |
| `onVoice` | `() => void` | — | |
| `hideAddContext` | `boolean` | `false` | |
| `hideModel` | `boolean` | `false` | |
| `hideVoice` | `boolean` | `false` | |
| `hideSend` | `boolean` | `false` | |
| `submitOnCmdEnter` | `boolean` | `true` | Cmd/Ctrl+Enter submits |
| `toolbarExtras` | `ReactNode` | — | Extra node in the right of the toolbar |

---

#### `<AsciiHero>`

A canvas-rendered ASCII field that reacts to the cursor.

```tsx
// Panel mode (default) — chrome'd card, use as a hero element
<AsciiHero />

// Background mode — absolutely positioned behind content
<div style={{ position: 'relative' }}>
  <AsciiHero
    variant="bare"
    colorful
    baseOpacity={0.18}
    spotlightOpacity={0.9}
    spotlightRadius={10}
  />
  <h1>Your content here</h1>
</div>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"panel" \| "bare"` | `"panel"` | `"panel"` adds a bordered card; `"bare"` has no chrome |
| `cols` / `rows` | `number` | auto | Grid dimensions in cells |
| `fontSize` | `number` | `11` | Font size in px |
| `fontFamily` | `string` | `"JetBrains Mono, ..."` | Must be monospace |
| `charRamp` | `string` | dense ramp | Characters from sparsest to densest |
| `colorful` | `boolean` | `false` | Paint with the default aurora palette |
| `palette` | `string[]` | — | Custom color palette (overrides `colorful`) |
| `baseOpacity` | `number` | `1` | Base alpha; drop to `~0.18` for background use |
| `reactive` | `boolean` | `true` | Enable cursor ripple + spotlight |
| `rippleStrength` | `number` | `1.4` | Cursor ripple amplitude |
| `rippleRadius` | `number` | `6` | Ripple falloff radius (cells) |
| `spotlightOpacity` | `number` | — | Alpha at the cursor center |
| `spotlightRadius` | `number` | `8` | Spotlight radius (cells) |
| `frameMs` | `number` | `50` | ms throttle between frames |

---

### Backgrounds

All background components are `aria-hidden` and sit **absolutely inside a `position: relative` parent**.

#### `<Aurora>`

Three-blob drifting gradient — the background that powers the entire AI hero trade.

```tsx
<div style={{ position: 'relative', height: 400 }}>
  <Aurora />
  <h1>Your content</h1>
</div>

// Lava-lamp mode — blobs interact like bubbles
<Aurora animated repulsion={0.25} />

// Custom blobs
<Aurora
  blobs={[
    { color: 'rgba(124,58,237,0.45)', x: 20, y: 30, size: 60 },
    { color: 'rgba(236,72,153,0.35)', x: 80, y: 25, size: 50 },
  ]}
  blur={60}
/>

// No animation
<Aurora static />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `blobs` | `Array<{ color: string; x: number; y: number; size?: number }>` | 3 defaults | Color blobs. `x`/`y` are percentages |
| `blur` | `number` | `50` | Blur in px |
| `static` | `boolean` | `false` | Disable the slow drift animation |
| `animated` | `boolean` | `false` | Lava-lamp JS simulation; overrides CSS drift |
| `repulsion` | `number` | `0.18` | Blob repulsion strength when `animated` |

---

#### `<NodeGraphBackground>`

Canvas-rendered drifting dots connected by lines — signals "neural network, conceptually."

```tsx
<div style={{ position: 'relative', height: 400 }}>
  <NodeGraphBackground />
</div>

<NodeGraphBackground
  density={50}
  linkColor="hotpink"
  colors={['#a78bfa', '#67e8f9']}
  hoverDistance={300}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `density` | `number` | `70` | Number of nodes |
| `speed` | `number` | `0.4` | Pixel speed per frame |
| `linkDistance` | `number` | `140` | Max distance (px) for a link to appear |
| `colors` | `string[]` | purples/cyan | Node colors |
| `linkColor` | `string` | `"#7c3aed"` | Line color |
| `hoverDistance` | `number` | `200` | Cursor influence radius (px). `0` disables |
| `hoverGravity` | `number` | `0.005` | Strength of cursor pull on nearby nodes |
| `hoverBrighten` | `number` | `0.8` | Opacity boost on nodes/edges near cursor |
| `baseOpacity` | `number` | `0.45` | Resting opacity for nodes and lines |
| `overscan` | `number` | `80` | px the simulation world extends past the viewport |

---

#### `<FloatingSparkles>`

A field of ✦ glyphs slowly drifting upward. Pure CSS animation.

```tsx
<div style={{ position: 'relative' }}>
  <FloatingSparkles />
</div>

<FloatingSparkles
  count={30}
  glyphs={['✦', '✧', '·']}
  durationS={[6, 14]}
  sizeRange={[10, 24]}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `18` | Number of sparkles |
| `glyphs` | `string[]` | `["✦","✧","✶","✺","✹","·"]` | Pool of glyphs |
| `durationS` | `[min, max]` | `[8, 18]` | Float-up duration range in seconds |
| `sizeRange` | `[min, max]` | `[8, 20]` | Font size range in px |

---

### Surfaces

#### `<GlassCard>`

Glassmorphism feature card. Compound component: drop subparts in any order.

```tsx
<GlassCard breathing glowOnHover>
  <GlassCard.Icon>✦</GlassCard.Icon>
  <GlassCard.Title>Reason</GlassCard.Title>
  <GlassCard.Body>Multi-step, multi-modal, multi-vendor.</GlassCard.Body>
  <GlassCard.Link href="/learn">Learn more</GlassCard.Link>
</GlassCard>
```

**`<GlassCard>` props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `breathing` | `boolean` | `false` | Slow breathing glow animation |
| `glowOnHover` | `boolean` | `true` | Gradient halo on hover |

**Subcomponents:** `GlassCard.Icon`, `GlassCard.Title`, `GlassCard.Body`, `GlassCard.Link`  
All accept standard HTML props for their respective tags (`div`, `h3`, `p`, `a`).

---

#### `<MockIDE>`

Mock IDE with token-by-token "AI is writing…" code stream. Stays dark regardless of page theme.

```tsx
const tokens = [
  { c: 'function ', cls: 'key' },
  { c: 'greet', cls: 'fn' },
  { c: '(name: ', cls: '' },
  { c: 'string', cls: 'key' },
  { c: ') {\n  return ' },
  { c: '`Hello, ${name}!`', cls: 'str' },
  { c: ';\n}' },
];

<MockIDE filename="greet.ts" tokens={tokens} />

// No thinking label, no loop
<MockIDE
  filename="index.ts"
  tokens={tokens}
  loop={false}
  thinkingLabel={false}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filename` | `string` | — | Filename shown in the tab |
| `tokens` | `IdeToken[]` | — | Tokens to type out |
| `loop` | `boolean` | `true` | Loop after finishing |
| `charMs` | `[min, max]` | `[14, 42]` | ms range per character |
| `thinkingLabel` | `ReactNode \| false` | `"AI is writing…"` | Thinking pill label |

**`IdeToken`:**

```ts
interface IdeToken {
  c: string;                                   // raw text (include whitespace/newlines)
  cls?: 'key' | 'str' | 'num' | 'com' | 'fn' | ''; // syntax color class
}
```

**Subcomponents:** `MockIDE.Chrome`, `MockIDE.Body` (for custom layouts).

---

### Conversation

#### `<ChatBubble>`

Chat bubbles for fake conversations. AI bubbles ship with a meta row (sparkle + agent name + thinking pill).

```tsx
<ChatBubble role="user">Hello.</ChatBubble>

<ChatBubble role="ai" agent="Synthi" thinking="reasoning…">
  I can help with that.
</ChatBubble>

// No thinking pill, custom icon
<ChatBubble role="ai" agent="GPT-5" thinking={false} icon={<img src="…" />}>
  Here's your answer.
</ChatBubble>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `role` | `"user" \| "ai"` | required | |
| `agent` | `ReactNode` | — | AI-only: agent name in the meta row |
| `thinking` | `ReactNode \| false` | `"thinking…"` | AI-only: thinking pill text |
| `icon` | `ReactNode \| false` | `<Sparkle />` | AI-only: leading icon |

---

#### `<TokenStream>`

Reveals text token-by-token with a trailing blinking caret.

```tsx
<TokenStream text="Reasoning, but visibly." />

<TokenStream
  text="This streams word by word."
  speedMs={[30, 100]}
  loop
  loopDelayMs={3000}
  hideCaret
  onComplete={() => console.log('done')}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | required | |
| `speedMs` | `number \| [min, max]` | `[18, 80]` | ms between tokens |
| `tokenize` | `(text: string) => string[]` | words + whitespace | Custom tokenizer |
| `loop` | `boolean` | `false` | Restart after finishing |
| `loopDelayMs` | `number` | `6000` | ms before restarting |
| `onComplete` | `() => void` | — | Fired when streaming completes |
| `hideCaret` | `boolean` | `false` | Hide the trailing blinking caret |

---

#### `<ChatFAB>`

The bottom-right "Ask AI" floating button + its popover.

```tsx
<ChatFAB
  popover={
    <>
      <ChatFAB.Header>Hi, I'm Synthi.</ChatFAB.Header>
      <ChatFAB.Body>Ask me anything about our product.</ChatFAB.Body>
    </>
  }
/>

// Controlled
<ChatFAB
  label="Chat with AI"
  open={isOpen}
  onOpenChange={setIsOpen}
  popover={<>…</>}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `ReactNode` | `"Ask AI"` | Button label |
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Initial open state |
| `onOpenChange` | `(open: boolean) => void` | — | |
| `popover` | `ReactNode` | — | Popover contents |

**Subcomponents:** `ChatFAB.Header` (accepts `onClose?: () => void`), `ChatFAB.Body`

---

### Social Proof

#### `<LogoMarquee>`

Infinite-scroll customer logo wall. Duplicates the track for a seamless loop. Mix image logos with text logos.

```tsx
<LogoMarquee
  logos={[
    { kind: 'img', src: '/logos/vercel.svg', alt: 'Vercel' },
    { kind: 'img', src: '/logos/stripe.svg', alt: 'Stripe' },
    { kind: 'node', node: <span>Bloomberg</span>, key: 'bloomberg' },
  ]}
/>

<LogoMarquee
  logos={logos}
  speed={60}
  gap={80}
  fade={false}
  pauseOnHover
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `logos` | `MarqueeItem[]` | required | `{ kind: 'img', src, alt? }` or `{ kind: 'node', node, key? }` |
| `speed` | `number` | `40` | Seconds for one full loop |
| `gap` | `number` | `56` | Gap between logos in px |
| `fade` | `boolean` | `true` | Apply edge-fade mask |
| `pauseOnHover` | `boolean` | `false` | Pause on hover |

---

#### `<LogoRow>`

A static row of logos for backers, press, or universities.

```tsx
<LogoRow
  heading="Backed by"
  logos={[
    { kind: 'img', src: '/logos/a16z.svg', alt: 'a16z' },
    { kind: 'node', node: <span>Y Combinator</span>, key: 'yc' },
  ]}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `heading` | `ReactNode` | — | Caption text (e.g. "Backed by") |
| `logos` | `LogoRowItem[]` | required | Same shape as `MarqueeItem` |

---

#### `<StatCounter>`

Animated count-up. Used for "Trusted by 51,842 builders" and friends.

```tsx
<StatCounter target={51842} />
<StatCounter target={99.99} format={(n) => n.toFixed(2) + '%'} />
<StatCounter target={1000} durationMs={2000} from={500} />
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `target` | `number` | required | End value |
| `durationMs` | `number` | `1800` | Animation duration in ms |
| `from` | `number` | `0` | Starting value |
| `ease` | `(t: number) => number` | ease-out-cubic | Easing function |
| `format` | `(value: number) => string` | `n.toLocaleString()` | Number formatter |

---

#### `<CommunityBadge>`

"Star us on GitHub" / "Join the Discord" social-proof tile.

```tsx
<CommunityBadge
  icon="https://cdn.jsdelivr.net/npm/simple-icons@11/icons/github.svg"
  title="Star us on GitHub"
  subtitle={<><b>12,847</b> stars · +184 this week</>}
  href="https://github.com/…"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `icon` | `string` | — | SVG icon src |
| `iconNode` | `ReactNode` | — | Render any node instead of `<img>` |
| `title` | `ReactNode` | required | |
| `subtitle` | `ReactNode` | required | |
| `href` | `string` | — | Link destination (standard `<a>` prop) |

---

### Pricing / Waitlist

#### `<PricingCard>`

Pricing card. Compose any subset of subcomponents in any order.

```tsx
<PricingCard featured>
  <PricingCard.Flag>Most popular</PricingCard.Flag>
  <PricingCard.Tier>Pro</PricingCard.Tier>
  <PricingCard.Amount unit="/mo">$49</PricingCard.Amount>
  <PricingCard.Blurb>For serious builders.</PricingCard.Blurb>
  <PricingCard.Features>
    <li>Unlimited projects</li>
    <li>Priority support</li>
  </PricingCard.Features>
  <PricingCard.CTA href="/upgrade">Upgrade</PricingCard.CTA>
</PricingCard>
```

**`<PricingCard>` props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `featured` | `boolean` | `false` | "Pro" tier glow + lift |

**`<PricingCard.Flag>` props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `hideSparkle` | `boolean` | `false` | Hide the leading ✦ |

**Subcomponents:** `PricingCard.Flag`, `PricingCard.Tier`, `PricingCard.Amount` (`unit?: ReactNode`), `PricingCard.Blurb`, `PricingCard.Features` (`<ul>`), `PricingCard.CTA` (`<a>`)

---

#### `<BeforeAfter>`

The Before/After AI split. Use the shorthand `before`/`after` arrays, or compose the compound parts.

```tsx
// Quick form
<BeforeAfter
  brand="Synthi"
  before={['Manual email drafts', 'Copy-paste everything', '3 hours per day']}
  after={['AI-written in seconds', 'Automated workflows', '15 minutes per day']}
/>

// Compound form for full control
<BeforeAfter>
  <BeforeAfter.Before label="Without Synthi">
    <ul>…</ul>
  </BeforeAfter.Before>
  <BeforeAfter.Arrow brand="Synthi" />
  <BeforeAfter.After label="With Synthi">
    <ul>…</ul>
  </BeforeAfter.After>
</BeforeAfter>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `before` | `ReactNode[]` | — | Array of "before" line items |
| `after` | `ReactNode[]` | — | Array of "after" line items |
| `brand` | `ReactNode` | — | Brand name shown over the arrow |
| `beforeLabel` | `ReactNode` | `"Before"` | Panel header label |
| `afterLabel` | `ReactNode` | `"After"` | Panel header label |

---

#### `<WaitlistForm>`

Inline email-capture form. Pair with `<StatCounter>` for the "Join 8,247 builders" headline.

```tsx
<WaitlistForm onSubmit={(email) => subscribe(email)} />

<WaitlistForm
  placeholder="founder@startup.ai"
  ctaLabel="Get early access"
  footnote="No spam. Unsubscribe anytime."
  leading={false}
  onSubmit={handleSubmit}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `placeholder` | `string` | `"you@startup.ai"` | |
| `defaultValue` | `string` | `""` | Initial input value |
| `ctaLabel` | `ReactNode` | `"Notify me"` | Submit button label |
| `leading` | `ReactNode \| false` | envelope SVG | Leading icon |
| `footnote` | `ReactNode` | — | Small text below the form |
| `onSubmit` | `(email: string) => void` | — | |

---

#### `<Popover>`

The conversion-killing newsletter modal that every AI startup ships. Takes over the entire screen, blurs everything behind it, and specifically does **not** close on Escape or backdrop click by default.

```tsx
<Popover
  timer={5000}
  title="Subscribe to my newsletter"
  closeLabel="No thanks, I haven't raised my seed round yet."
>
  <WaitlistForm onSubmit={() => setOpen(false)} />
</Popover>

// Controlled
<Popover
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Before you go…"
  closeOnEscape
>
  <WaitlistForm onSubmit={() => setIsOpen(false)} />
</Popover>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `open` | `boolean` | — | Controlled open state |
| `defaultOpen` | `boolean` | `false` | Uncontrolled initial state |
| `onOpenChange` | `(open: boolean) => void` | — | |
| `timer` | `number` | `0` | ms before auto-opening. `0` disables |
| `title` | `ReactNode` | — | Title at the top |
| `closeLabel` | `ReactNode \| false` | `"Maybe later"` | Dismissal link text |
| `closeOnEscape` | `boolean` | `false` | Allow Escape to close |
| `closeOnBackdrop` | `boolean` | `false` | Allow backdrop click to close |
| `container` | `HTMLElement \| null` | `document.body` | Portal render target |

---

## Hooks

Hooks are the escape hatches for headless usage — use them when you want the animation logic without the component markup.

### `useTypewriter`

Headless typewriter. Returns the in-progress text on every tick.

```ts
const { word, index, isDeleting, isComplete } = useTypewriter({
  words: ['doctors', 'lawyers', 'founders'],
  typeMs: 70,
  deleteMs: 32,
  holdMs: 1500,
  loop: true,
  onWordReached: (word, i) => console.log(`Reached: ${word}`),
});
```

**Options** (`UseTypewriterOptions`)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `words` | `string[]` | required | |
| `typeMs` | `number` | `70` | ms per character while typing |
| `deleteMs` | `number` | `32` | ms per character while deleting |
| `holdMs` | `number` | `1500` | ms to hold the fully-typed word |
| `loop` | `boolean` | `true` | Stop after a single pass when `false` |
| `onWordReached` | `(word, index) => void` | — | |

**Returns** (`UseTypewriterResult`)

| Key | Type | Description |
|-----|------|-------------|
| `word` | `string` | Current in-progress text |
| `index` | `number` | Index of the target word |
| `isDeleting` | `boolean` | |
| `isComplete` | `boolean` | Only `true` when `loop: false` and last word shown |

> **Remount to swap word lists.** The effect only resets on mount. Use `key={…}` on the host component to restart with new words.

---

### `useCounter`

Animates a number from `from` to `target` over `durationMs`.

```ts
const value = useCounter({ target: 51842 });
// Returns current integer, counts up from 0 on mount

const pct = useCounter({
  target: 99.5,
  durationMs: 2000,
  from: 80,
  ease: (t) => t * t,
});
```

**Options** (`UseCounterOptions`)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `target` | `number` | required | End value |
| `durationMs` | `number` | `1800` | |
| `from` | `number` | `0` | Start value |
| `ease` | `(t: number) => number` | ease-out-cubic | Easing fn where `t ∈ [0, 1]` |

**Returns:** `number` (current integer value)

---

### `useTokenStream`

Reveals text token-by-token. The fake AI-streaming demo.

```ts
const { output, isStreaming, isComplete } = useTokenStream({
  text: 'Reasoning, but visibly.',
  speedMs: [18, 80],
  loop: true,
  loopDelayMs: 4000,
  onComplete: () => console.log('done'),
});
```

**Options** (`UseTokenStreamOptions`)

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `text` | `string` | required | |
| `speedMs` | `number \| [min, max]` | `[18, 80]` | ms between tokens |
| `tokenize` | `(text: string) => string[]` | words + whitespace | |
| `loop` | `boolean` | `false` | |
| `loopDelayMs` | `number` | `6000` | ms before restarting |
| `onComplete` | `() => void` | — | |

**Returns** (`UseTokenStreamResult`)

| Key | Type |
|-----|------|
| `output` | `string` |
| `isStreaming` | `boolean` |
| `isComplete` | `boolean` |

---

### `useAsciiField`

Drives a `<canvas>` (sized to its `host` parent) with a procedural ASCII field. Auto-resizes on container change.

```tsx
const canvasRef = useRef<HTMLCanvasElement>(null);
const hostRef = useRef<HTMLDivElement>(null);

useAsciiField(canvasRef, hostRef, {
  colorful: true,
  baseOpacity: 0.18,
  spotlightOpacity: 0.9,
  reactive: true,
});

return (
  <div ref={hostRef} style={{ position: 'relative', width: '100%', height: 300 }}>
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
  </div>
);
```

**Signature:**

```ts
useAsciiField(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  hostRef: RefObject<HTMLElement | null>,
  options?: UseAsciiFieldOptions,
): void
```

**Options** (`UseAsciiFieldOptions`) — same as `AsciiHero` props (minus `variant`):

| Option | Type | Default |
|--------|------|---------|
| `cols` / `rows` | `number` | auto |
| `fontSize` | `number` | `11` |
| `fontFamily` | `string` | JetBrains Mono |
| `charRamp` | `string` | dense ramp |
| `colorful` | `boolean` | `false` |
| `palette` | `string[]` | — |
| `baseOpacity` | `number` | `1` |
| `reactive` | `boolean` | `true` |
| `rippleStrength` | `number` | `1.4` |
| `rippleRadius` | `number` | `6` |
| `spotlightOpacity` | `number` | — |
| `spotlightRadius` | `number` | `8` |
| `frameMs` | `number` | `50` |

---

## Utility

### `cn`

A `clsx`-compatible class-name helper re-exported for convenience.

```ts
import { cn } from 'performative-ui';

<div className={cn('base-class', isActive && 'active', className)} />
```

---

## Full Landing Page Example

```tsx
import {
  StickyBanner,
  Aurora,
  FloatingSparkles,
  EyebrowPill,
  GradientText,
  WordRoll,
  PromptHero,
  StatCounter,
  WaitlistForm,
  GlassCard,
  LogoMarquee,
  BeforeAfter,
  PricingCard,
  ChatBubble,
  TokenStream,
  MockIDE,
  Popover,
  Sparkle,
} from 'performative-ui';

export function LandingPage() {
  return (
    <>
      {/* Announcement bar */}
      <StickyBanner trailing={<a href="/blog">Read more →</a>}>
        We just closed our $40M Series B 🎉
      </StickyBanner>

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <Aurora animated />
        <FloatingSparkles count={12} />

        <EyebrowPill>Now in public beta</EyebrowPill>

        <h1>
          The AI platform for{' '}
          <GradientText>
            <WordRoll words={['doctors', 'lawyers', 'founders']} gradient />
          </GradientText>
        </h1>

        <PromptHero
          placeholder="Describe the product you want to build…"
          onSubmit={(text) => console.log(text)}
        />

        <p>
          Join <StatCounter target={51842} /> builders shipping with Synthi.
        </p>
      </section>

      {/* Feature cards */}
      <section>
        {['Reason', 'Generate', 'Deploy'].map((title) => (
          <GlassCard key={title} breathing glowOnHover>
            <GlassCard.Icon><Sparkle /></GlassCard.Icon>
            <GlassCard.Title>{title}</GlassCard.Title>
            <GlassCard.Body>Multi-step, multi-modal, multi-vendor.</GlassCard.Body>
            <GlassCard.Link href="/learn">Learn more</GlassCard.Link>
          </GlassCard>
        ))}
      </section>

      {/* Fake AI conversation */}
      <section>
        <ChatBubble role="user">Can you refactor this function?</ChatBubble>
        <ChatBubble role="ai" agent="Synthi" thinking="reasoning…">
          <TokenStream text="Sure! Here's a cleaner version…" loop />
        </ChatBubble>
        <MockIDE
          filename="refactored.ts"
          tokens={[{ c: 'const ', cls: 'key' }, { c: 'result', cls: 'fn' }]}
        />
      </section>

      {/* Social proof */}
      <LogoMarquee
        logos={[
          { kind: 'img', src: '/logos/vercel.svg', alt: 'Vercel' },
          { kind: 'node', node: <span>Bloomberg</span>, key: 'bloomberg' },
        ]}
        pauseOnHover
      />

      {/* Before/After */}
      <BeforeAfter
        brand="Synthi"
        before={['3 hours per day', 'Manual everything', 'Constant context-switching']}
        after={['15 minutes per day', 'Fully automated', 'Stay in flow']}
      />

      {/* Pricing */}
      <div style={{ display: 'flex', gap: 24 }}>
        <PricingCard>
          <PricingCard.Tier>Starter</PricingCard.Tier>
          <PricingCard.Amount unit="/mo">Free</PricingCard.Amount>
          <PricingCard.CTA href="/signup">Get started</PricingCard.CTA>
        </PricingCard>

        <PricingCard featured>
          <PricingCard.Flag>Most popular</PricingCard.Flag>
          <PricingCard.Tier>Pro</PricingCard.Tier>
          <PricingCard.Amount unit="/mo">$49</PricingCard.Amount>
          <PricingCard.Features>
            <li>Unlimited projects</li>
            <li>Priority support</li>
          </PricingCard.Features>
          <PricingCard.CTA href="/upgrade">Upgrade</PricingCard.CTA>
        </PricingCard>
      </div>

      {/* Waitlist */}
      <WaitlistForm
        footnote="We email weekly. No spam."
        onSubmit={(email) => console.log(email)}
      />

      {/* The obtrusive modal */}
      <Popover
        timer={8000}
        title="Before you go — join the waitlist"
        closeLabel="No thanks, I haven't product-market fit yet."
      >
        <WaitlistForm onSubmit={() => {}} />
      </Popover>
    </>
  );
}
```
