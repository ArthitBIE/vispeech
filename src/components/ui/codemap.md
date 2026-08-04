# src/components/ui/

## Responsibility

Presentational component primitive layer (design system). Provides the reusable, theme-aware UI atoms (Button, Card, Input, Badge, Sheet, etc.) that all app pages and layout components compose into screens. Components carry no business logic or data-fetching; they render props and callbacks.

## Design

- **shadcn/ui component primitives** (New York style, Tailwind CSS 4 / `data-slot` attributes): thin wrappers over Radix UI primitives styled with `cn()` + Tailwind, exporting sub-components per pattern (e.g. `CardHeader/CardTitle/CardContent`, `SheetTrigger/SheetContent/SheetTitle`).
- **Radix UI composition**: stateful behavior (open/close, selection, keyboard nav, focus) delegated to `radix-ui` primitives — `Avatar`, `Collapsible`, `DropdownMenu`, `Progress`, `Select`, `Separator`, `Sheet` (Dialog), `Slider`, `Switch`, `Tabs`, `Tooltip`, `Label` (`@radix-ui/react-label`).
- **CVA variants** (`class-variance-authority`): `buttonVariants` (variant × size: default/destructive/outline/secondary/ghost/link/success × default/sm/lg/icon), `badgeVariants` (default/secondary/destructive/outline/ghost/link), `tabsListVariants` (default/line).
- **Compound component pattern**: Root component manages state via Radix context; children (Trigger, Content, Item, etc.) read it implicitly.
- **`asChild` polymorphism**: Button, Badge, BreadcrumbLink use Radix `Slot.Root` to render as the parent element (e.g. `<Button asChild><Link>`).
- **"use client"** directive on all interactive Radix-wrapped components; pure-styled components (badge, breadcrumb, card, input, table) are server-compatible.
- **Deviation from stock shadcn**: `Card` adds `variant`/`padded`/`interactive` props via inline map; `Input` is a forwardRef wrapper adding `label`/`error`/`helper` affordances (renders `Label` + validation text); `Button` adds a `success` variant; `SheetContent` adds `side` + `showCloseButton`; components set `data-slot` + `data-variant`/`data-size` for Tailwind 4 data-attribute styling.

## Flow

1. Pages/feature components import a primitive (e.g. `Button`, `SheetContent`) with props: `className` (merged via `cn`), variant/size, and HTML/Radix props.
2. `cn()` merges base Tailwind classes + variant classes from CVA + caller `className` (tailwind-merge resolves conflicts).
3. Stateful components mount a Radix Root (`DropdownMenu.Root`, `Select.Root`, `Tabs.Root`, `Sheet.Root`...); child parts receive open/selected/checked state via Radix context; open/select callbacks (`onValueChange`, `onOpenChange`) pass through to the caller.
4. Portal-based content (`DropdownMenuContent`, `SelectContent`, `SheetContent`, `TooltipContent`) renders into `document.body` via Radix `Portal`; positioning/animation driven by Radix data-attributes (`data-[state=open]`, `data-[side=...]`) consumed by Tailwind animation classes.
5. Controlled inputs: `Input` (label/error/helper), `Switch`, `Slider`, `Progress` (`value` → `translateX(-${100 - value}%)`), `Select` — value flows in from caller state, change events flow back up via callbacks.

## Integration

- **Consumed by**: pages `src/app/(app)/dashboard|home|settings/page.tsx`, `src/app/practice/session/page.tsx`, `src/app/summary/page.tsx`, `src/app/auth/signin|signup/page.tsx`; feature/layout components `src/components/practice/PracticeWord.tsx`, `PracticeResultSidebar.tsx`, `src/components/layout/{AppShell,Sidebar,Header,AppBreadcrumb}.tsx`, `src/components/SupabaseNotConfigured.tsx`.
- **Depends on**: `radix-ui` (and `@radix-ui/react-label`), `class-variance-authority`, `lucide-react` (icons: ChevronRight, MoreHorizontal, CheckIcon, XIcon, ChevronDown/UpIcon, CircleIcon), Tailwind CSS 4 theme tokens (`--color-*`: primary, muted, destructive, popover, ring, border, background) via `globals.css`, and `cn()` from `@/lib/utils`; internal coupling `input.tsx → label.tsx`.
