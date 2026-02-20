# ⚡ Blazecn

**A shadcn/ui-compatible component library for InfernoJS.**

Blazecn brings the design language, token system, and component patterns of [shadcn/ui](https://ui.shadcn.com) to [InfernoJS](https://infernojs.org) — the fastest JavaScript UI library. No React dependency. No Radix. Just pure `createElement` components with Tailwind CSS v4 and `class-variance-authority`.

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
  --color-popover: oklch(0.17 0.014 260);
  --color-popover-foreground: oklch(0.90 0.008 260);
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

### Use in your project

Blazecn follows the shadcn philosophy — **you own the code**. Copy the component files you need from `src/` into your project, or reference the package directly via tsconfig paths:

```json
{
  "compilerOptions": {
    "paths": {
      "blazecn": ["path/to/blazecn/src/index.ts"],
      "blazecn/*": ["path/to/blazecn/src/*"]
    }
  }
}
```

## Components (49)

### Core

| Component | Description | Variants / Slots |
|-----------|-------------|------------------|
| **Button** | Primary action element | `default` · `destructive` · `outline` · `secondary` · `ghost` · `link` × sizes `default` · `sm` · `xs` · `lg` · `icon` |
| **ButtonGroup** | Grouped buttons | `horizontal` · `vertical` orientation, removes inner radii |
| **Badge** | Status indicator / label | `default` · `secondary` · `destructive` · `outline` · `ghost` |
| **Card** | Composable card container | `CardHeader` · `CardTitle` · `CardDescription` · `CardContent` · `CardFooter` |

### Form

| Component | Description | Notes |
|-----------|-------------|-------|
| **Input** | Text input field | Styled with `border-input`, focus ring |
| **InputOTP** | One-time password input | `InputOTP` · `InputOTPGroup` · `InputOTPSeparator` — auto-focus, paste, backspace nav |
| **Textarea** | Multi-line text input | Auto-styled like Input |
| **Label** | Accessible form label | `data-slot="label"` |
| **Switch** | Toggle switch | `role="switch"`, `onChange(checked)` callback |
| **Checkbox** | Checkbox control | ARIA-compliant, custom styled |
| **RadioGroup** | Radio button group | `RadioGroup` + `RadioGroupItem` |
| **Select** | Dropdown select | `Select` · `SelectTrigger` · `SelectValue` · `SelectContent` · `SelectItem` · `SelectSeparator` |
| **Slider** | Range slider | Min/max/step, thumb + track styling |

### Data Display

| Component | Description | Notes |
|-----------|-------------|-------|
| **Avatar** | User avatar with fallback | `Avatar` · `AvatarImage` · `AvatarFallback` — handles load errors |
| **Table** | Data table | `Table` · `TableHeader` · `TableBody` · `TableFooter` · `TableRow` · `TableHead` · `TableCell` · `TableCaption` |
| **Separator** | Horizontal / vertical divider | `horizontal` · `vertical` orientation |
| **Spinner** | Loading indicator | Sizes: `sm` · `default` · `lg` |
| **Skeleton** | Animated loading placeholder | Pulse animation |
| **Progress** | Progress bar | `value` prop (0–100) |
| **Alert** | Alert message | `Alert` · `AlertTitle` · `AlertDescription` — variants: `default` · `destructive` |
| **Empty** | Empty state placeholder | `Empty` · `EmptyIcon` · `EmptyTitle` · `EmptyDescription` · `EmptyActions` |
| **Kbd** | Keyboard key display | `Kbd` · `KbdGroup` — mono font, border styling |
| **Typography** | Semantic text components | `H1` · `H2` · `H3` · `H4` · `P` · `Blockquote` · `InlineCode` · `Lead` · `Large` · `Small` · `Muted` · `List` |

### Navigation & Interaction

| Component | Description | Notes |
|-----------|-------------|-------|
| **Tabs** | Tab navigation | `Tabs` · `TabsList` · `TabsTrigger` · `TabsContent` |
| **Toggle** | Toggle button | Variants: `default` · `outline` × sizes `default` · `sm` · `lg` |
| **ToggleGroup** | Group of toggles | `ToggleGroup` · `ToggleGroupItem` — single/multi select |
| **Accordion** | Collapsible sections | `Accordion` · `AccordionItem` · `AccordionTrigger` · `AccordionContent` |
| **Collapsible** | Single collapsible | `Collapsible` · `CollapsibleTrigger` · `CollapsibleContent` |
| **Breadcrumb** | Breadcrumb navigation | `Breadcrumb` · `BreadcrumbList` · `BreadcrumbItem` · `BreadcrumbLink` · `BreadcrumbPage` · `BreadcrumbSeparator` · `BreadcrumbEllipsis` |
| **NavigationMenu** | Horizontal nav with dropdowns | `NavigationMenu` · `NavigationMenuList` · `NavigationMenuItem` · `NavigationMenuTrigger` · `NavigationMenuContent` · `NavigationMenuLink` |
| **Menubar** | Desktop-style menu bar | `Menubar` · `MenubarMenu` · `MenubarTrigger` · `MenubarContent` · `MenubarItem` · `MenubarSeparator` · `MenubarLabel` · `MenubarShortcut` |
| **Pagination** | Page navigation | `Pagination` · `PaginationContent` · `PaginationItem` · `PaginationLink` · `PaginationPrevious` · `PaginationNext` · `PaginationEllipsis` |
| **Carousel** | Sliding content carousel | `Carousel` · `CarouselContent` · `CarouselItem` · `CarouselPrevious` · `CarouselNext` — horizontal/vertical |

### Overlay

| Component | Description | Notes |
|-----------|-------------|-------|
| **AlertDialog** | Confirmation dialog | `AlertDialog` · `AlertDialogContent` · `AlertDialogOverlay` · `AlertDialogHeader` · `AlertDialogFooter` · `AlertDialogTitle` · `AlertDialogDescription` · `AlertDialogAction` · `AlertDialogCancel` |
| **Dialog** | Modal dialog | `Dialog` · `DialogContent` · `DialogOverlay` · `DialogHeader` · `DialogFooter` · `DialogTitle` · `DialogDescription` |
| **Sheet** | Slide-out panel | `Sheet` · `SheetContent` · `SheetOverlay` · `SheetHeader` · `SheetFooter` · `SheetTitle` · `SheetDescription` — sides: `top` · `right` · `bottom` · `left` |
| **Drawer** | Mobile bottom sheet | `Drawer` · `DrawerContent` · `DrawerHeader` · `DrawerFooter` · `DrawerTitle` · `DrawerDescription` · `DrawerClose` — animated transitions |
| **DropdownMenu** | Dropdown menu | `DropdownMenu` · `DropdownMenuTrigger` · `DropdownMenuContent` · `DropdownMenuItem` · `DropdownMenuSeparator` · `DropdownMenuLabel` · `DropdownMenuGroup` |
| **ContextMenu** | Right-click menu | `ContextMenu` · `ContextMenuTrigger` · `ContextMenuContent` · `ContextMenuItem` · `ContextMenuSeparator` · `ContextMenuLabel` · `ContextMenuShortcut` |
| **Command** | Command palette / search | `Command` · `CommandInput` · `CommandList` · `CommandEmpty` · `CommandGroup` · `CommandItem` · `CommandSeparator` · `CommandShortcut` · `CommandDialog` |
| **Popover** | Popover panel | `Popover` · `PopoverTrigger` · `PopoverContent` — click-outside + escape handling |
| **HoverCard** | Hover content card | `HoverCard` · `HoverCardTrigger` · `HoverCardContent` · `HoverCardWrapper` — configurable delay |
| **Tooltip** | Hover tooltip | Configurable `side` and `delay` |
| **Toast** | Toast notifications | `toast()` · `dismissToast()` · `Toaster` — imperative API |

### Layout

| Component | Description | Notes |
|-----------|-------------|-------|
| **ScrollArea** | Custom scrollbar container | Styled overflow area |
| **AspectRatio** | Fixed aspect ratio wrapper | `ratio` prop (default 16/9) |
| **Resizable** | Resizable panel layout | `ResizablePanelGroup` · `ResizablePanel` · `ResizableHandle` — horizontal/vertical, drag handles |

### Theme

| Component | Description | Notes |
|-----------|-------------|-------|
| **ThemeToggle** | Light/dark/system toggle | Persists to localStorage, applies `dark` class |

## Usage Examples

### Button

```tsx
import { Button } from 'blazecn';

// Variants
<Button>Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="xs">Extra Small</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">★</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from 'blazecn';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description text</CardDescription>
  </CardHeader>
  <CardContent>Card body content</CardContent>
  <CardFooter>Footer actions</CardFooter>
</Card>
```

### Dialog

```tsx
import { Dialog, DialogContent, DialogOverlay, DialogHeader, DialogTitle, DialogDescription } from 'blazecn';

<Dialog open={isOpen} onClose={() => setOpen(false)}>
  <DialogOverlay />
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Are you sure?</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    <Button onClick={() => setOpen(false)}>Confirm</Button>
  </DialogContent>
</Dialog>
```

### DropdownMenu

```tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from 'blazecn';

<DropdownMenu>
  <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
    <DropdownMenuItem onClick={handleDuplicate}>Duplicate</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem destructive onClick={handleDelete}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### Switch

```tsx
import { Switch } from 'blazecn';

<Switch checked={isEnabled} onChange={(checked) => setEnabled(checked)} />
```

### Toast

```tsx
import { toast, Toaster } from 'blazecn';

// Mount once in your app root
<Toaster />

// Call from anywhere
toast({ title: 'Saved', description: 'Your changes have been saved.' });
toast({ title: 'Error', description: 'Something went wrong.', variant: 'destructive' });
```

## Utilities

### cn()

Combines `clsx` and `tailwind-merge` for conditional, conflict-free class composition:

```ts
import { cn } from 'blazecn';

cn('px-4 py-2', isActive && 'bg-primary', className)
// Handles Tailwind conflicts: cn('px-4', 'px-6') → 'px-6'
```

### buttonVariants / badgeVariants / alertVariants / toggleVariants

Use variant functions outside components for links or custom elements:

```ts
import { buttonVariants } from 'blazecn';

<a href="/docs" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
  Read Docs
</a>
```

## Architecture

```
src/
├── utils.ts            # cn() utility (clsx + tailwind-merge)
├── index.ts            # Barrel export
│
├── Button.tsx          # cva variants (6 variants × 5 sizes)
├── ButtonGroup.tsx     # Grouped buttons (horizontal/vertical)
├── Badge.tsx           # cva variants (5 variants)
├── Card.tsx            # Composable slots (Header, Title, Description, Content, Footer)
│
├── Input.tsx           # Form input
├── InputOTP.tsx        # One-time password input with slot navigation
├── Textarea.tsx        # Form textarea
├── Label.tsx           # Form label
├── Switch.tsx          # Toggle switch (ARIA role="switch")
├── Checkbox.tsx        # Checkbox control
├── RadioGroup.tsx      # Radio button group
├── Select.tsx          # Dropdown select with trigger/content/items
├── Slider.tsx          # Range slider with thumb + track
│
├── Avatar.tsx          # Avatar with image + fallback
├── Table.tsx           # Data table (8 sub-components)
├── Separator.tsx       # Divider line
├── Spinner.tsx         # Loading indicator (3 sizes)
├── Skeleton.tsx        # Loading placeholder
├── Progress.tsx        # Progress bar
├── Alert.tsx           # Alert with title + description
├── Empty.tsx           # Empty state placeholder
├── Kbd.tsx             # Keyboard key display
├── Typography.tsx      # Semantic text components (12 variants)
│
├── Tabs.tsx            # Tab navigation
├── Toggle.tsx          # Toggle button (cva variants)
├── ToggleGroup.tsx     # Grouped toggles
├── Accordion.tsx       # Collapsible sections
├── Collapsible.tsx     # Single collapsible
├── Breadcrumb.tsx      # Breadcrumb navigation (7 sub-components)
├── NavigationMenu.tsx  # Horizontal nav with dropdown panels
├── Menubar.tsx         # Desktop-style menu bar
├── Pagination.tsx      # Page navigation
├── Carousel.tsx        # Sliding content carousel
│
├── AlertDialog.tsx     # Confirmation dialog (no close button)
├── Dialog.tsx          # Modal dialog
├── Sheet.tsx           # Slide-out panel (4 sides)
├── Drawer.tsx          # Mobile bottom sheet (animated)
├── DropdownMenu.tsx    # Dropdown menu with click-outside
├── ContextMenu.tsx     # Right-click context menu
├── Command.tsx         # Command palette / search
├── Popover.tsx         # Popover with click-outside
├── HoverCard.tsx       # Hover content card with delay
├── Tooltip.tsx         # Hover tooltip
├── Toast.tsx           # Toast notifications (imperative API)
│
├── ScrollArea.tsx      # Custom scrollbar container
├── AspectRatio.tsx     # Fixed aspect ratio wrapper
├── Resizable.tsx       # Resizable panel layout with drag handles
└── ThemeToggle.tsx     # Light/dark/system theme toggle
```

Every component:
- Uses `data-slot` attributes for identification (matches shadcn)
- Accepts `className` for composition via `cn()`
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

## Used By

- [Oni](https://github.com/TekkadanPlays/oni) — Owncast-compatible streaming frontend
- [Mycelium](https://github.com/TekkadanPlays/mycelium.social) — Nostr social client

## Related Projects

- [Kaji](https://github.com/TekkadanPlays/kaji) — TypeScript Nostr protocol library
- [nos2x-frog](https://github.com/TekkadanPlays/nos2x-frog) — Nostr signer browser extension

## License

MIT
