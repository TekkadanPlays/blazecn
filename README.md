# ⚡ Blazecn

**A shadcn/ui-compatible component library for InfernoJS.**

Blazecn brings the design language, token system, and component patterns of [shadcn/ui](https://ui.shadcn.com) to [InfernoJS](https://infernojs.org) — the fastest JavaScript UI library. No React dependency. No Radix. Just pure `createElement` components with Tailwind CSS v4 and `class-variance-authority`.

> **Live docs & component showcase:** [ribbit.network/docs](https://ribbit.network/docs)

## Why Blazecn?

- **shadcn-compatible tokens** — Same CSS custom properties (`--background`, `--foreground`, `--primary`, `--muted`, etc.)
- **Same class strings** — Button, Badge, Card, Input all use the exact Tailwind classes from shadcn
- **InfernoJS native** — Pure `createElement()` components, no JSX runtime required
- **Tiny footprint** — No Radix UI, no heavy abstractions. Each component is a single file
- **cva variants** — `class-variance-authority` for type-safe variant props
- **cn() utility** — `clsx` + `tailwind-merge` for conditional class composition
- **Accessible** — ARIA attributes, `role`, `data-slot` on every component

## Quick Start

### Install dependencies

```bash
bun add class-variance-authority clsx tailwind-merge
```

### Set up design tokens

Add to your `tailwind.css`:

```css
@import "tailwindcss";

@theme {
  --color-background: oklch(0.145 0.014 260);
  --color-foreground: oklch(0.90 0.008 260);
  --color-card: oklch(0.17 0.014 260);
  --color-card-foreground: oklch(0.90 0.008 260);
  --color-primary: oklch(0.68 0.19 150);
  --color-primary-foreground: oklch(0.13 0.02 150);
  --color-secondary: oklch(0.20 0.012 260);
  --color-secondary-foreground: oklch(0.90 0.008 260);
  --color-muted: oklch(0.20 0.012 260);
  --color-muted-foreground: oklch(0.55 0.01 260);
  --color-accent: oklch(0.22 0.014 260);
  --color-accent-foreground: oklch(0.90 0.008 260);
  --color-destructive: oklch(0.62 0.20 25);
  --color-destructive-foreground: oklch(0.97 0.01 17);
  --color-border: oklch(1 0 0 / 10%);
  --color-input: oklch(1 0 0 / 15%);
  --color-ring: oklch(0.68 0.19 150);

  --font-sans: 'Geist', system-ui, -apple-system, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, 'SF Mono', monospace;

  --radius-sm: calc(0.625rem - 4px);
  --radius-md: calc(0.625rem - 2px);
  --radius-lg: 0.625rem;
  --radius-xl: calc(0.625rem + 4px);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply antialiased bg-background text-foreground font-sans;
    font-synthesis-weight: none;
    text-rendering: optimizeLegibility;
  }
}
```

### Copy components

Blazecn follows the shadcn philosophy — **you own the code**. Copy the component files you need from `src/` into your project.

## Components

| Component | Description | Variants |
|-----------|-------------|----------|
| **Button** | Primary action element | `default` · `destructive` · `outline` · `secondary` · `ghost` · `link` |
| **Badge** | Status indicator / label | `default` · `secondary` · `destructive` · `outline` · `ghost` |
| **Card** | Composable card with slots | `CardHeader` · `CardTitle` · `CardDescription` · `CardContent` · `CardFooter` |
| **Input** | Text input field | — |
| **Textarea** | Multi-line text input | — |
| **Label** | Accessible form label | — |
| **Switch** | Toggle switch (`role="switch"`) | — |
| **Separator** | Horizontal / vertical divider | `horizontal` · `vertical` |
| **Spinner** | Loading indicator | `sm` · `default` · `lg` |
| **Skeleton** | Animated loading placeholder | — |

### Button

```ts
import { createElement } from 'inferno-create-element';
import { Button } from './ui/Button';

// Variants
createElement(Button, null, 'Default')
createElement(Button, { variant: 'destructive' }, 'Delete')
createElement(Button, { variant: 'outline' }, 'Outline')
createElement(Button, { variant: 'secondary' }, 'Secondary')
createElement(Button, { variant: 'ghost' }, 'Ghost')
createElement(Button, { variant: 'link' }, 'Link')

// Sizes
createElement(Button, { size: 'xs' }, 'Extra Small')
createElement(Button, { size: 'sm' }, 'Small')
createElement(Button, { size: 'lg' }, 'Large')
createElement(Button, { size: 'icon' }, '★')
```

### Card

```ts
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/Card';

createElement(Card, null,
  createElement(CardHeader, null,
    createElement(CardTitle, null, 'Card Title'),
    createElement(CardDescription, null, 'Card description text'),
  ),
  createElement(CardContent, null, 'Card body content'),
  createElement(CardFooter, null, 'Footer actions'),
)
```

### Switch

```ts
import { Switch } from './ui/Switch';

createElement(Switch, {
  checked: isEnabled,
  onChange: (checked) => setEnabled(checked),
})
```

## Utilities

### cn()

Combines `clsx` and `tailwind-merge` for conditional, conflict-free class composition:

```ts
import { cn } from './ui/utils';

cn('px-4 py-2', isActive && 'bg-primary', className)
// Handles Tailwind conflicts: cn('px-4', 'px-6') → 'px-6'
```

### buttonVariants / badgeVariants

Use variant functions outside components for links or custom elements:

```ts
import { buttonVariants } from './ui/Button';

createElement('a', {
  href: '/docs',
  className: buttonVariants({ variant: 'outline', size: 'sm' }),
}, 'Read Docs')
```

## Architecture

```
src/
├── utils.ts          # cn() utility
├── Button.tsx        # cva variants (6 variants × 6 sizes)
├── Badge.tsx         # cva variants (5 variants)
├── Card.tsx          # Composable slots (Header, Title, Description, Content, Footer)
├── Input.tsx         # Form input
├── Textarea.tsx      # Form textarea
├── Label.tsx         # Form label
├── Switch.tsx        # Toggle switch (ARIA role="switch")
├── Separator.tsx     # Divider line
├── Spinner.tsx       # Loading indicator (3 sizes)
├── Skeleton.tsx      # Loading placeholder
└── index.ts          # Barrel export
```

Every component:
- Uses `data-slot` attributes for identification (matches shadcn)
- Accepts `className` for composition via `cn()`
- Is a pure function (no class components, no hooks)
- Has zero external dependencies beyond Tailwind classes

## Design Tokens

Blazecn uses the same semantic token pairs as shadcn/ui:

| Token | Purpose |
|-------|---------|
| `background` / `foreground` | Page background and default text |
| `card` / `card-foreground` | Raised surface |
| `popover` / `popover-foreground` | Dropdowns, tooltips |
| `primary` / `primary-foreground` | Primary actions |
| `secondary` / `secondary-foreground` | Secondary actions |
| `muted` / `muted-foreground` | Subdued backgrounds and text |
| `accent` / `accent-foreground` | Hover/active states |
| `destructive` / `destructive-foreground` | Errors, danger |
| `border` | Default border color |
| `input` | Input border color |
| `ring` | Focus ring color |

## Related Projects

- [ribbit.network](https://github.com/TekkadanPlays/ribbit.network) — Nostr social client built with Blazecn
- [Kaji](https://github.com/TekkadanPlays/kaji) — InfernoJS-native Nostr protocol library
- [nos2x-frog](https://github.com/TekkadanPlays/nos2x-frog) — Nostr signer browser extension

## License

MIT
