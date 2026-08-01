---
name: vispeech
description: ฝึกออกเสียงภาษาไทยด้วยการวิเคราะห์รูปปากและเสียงพูด
colors:
  primary: "#4F46E5"
  primary-hover: "#4338CA"
  primary-light: "#EEF2FF"
  ink: "#111827"
  muted: "#6B7280"
  neutral-bg: "#F9FAFB"
  surface: "#FFFFFF"
  border-subtle: "#E5E7EB"
  border-default: "#D1D5DB"
  accent-green: "#16A34A"
  accent-amber: "#D97706"
  danger: "#DC2626"
  danger-light: "#FEF2F2"
typography:
  display:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 5vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: -0.03em
  headline:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 3vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: -0.02em
  title:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: normal
  label:
    fontFamily: "Geist, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: normal
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "12px 24px"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  input:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "10px 16px"
    height: "42px"
---

# Design System: vispeech

## 1. Overview

**Creative North Star: "The Voice Mirror"**

vispeech is where a learner meets their own reflection — literally on camera, figuratively in the data. The interface is a warm, well-lit room with a mirror: encouraging without being saccharine, clear without being clinical. Every screen centers the learner's moment, not the app's chrome.

The system pairs a bold, confident primary (indigo) with soft, approachable surfaces. Shadows are present but gentle, defining depth without demanding attention. The palette stays restrained — one clear accent, clean neutrals — so the learner's face and the practice word are always the focal point.

**Key Characteristics:**

- One-color accent system with soft neutral surfaces
- Clear elevation hierarchy through defined shadow layers
- Generous breathing room around every focus point
- Thai-first language with friendly, encouraging voice
- Rounded but not pill-like — soft curves (12-16px) on containers

## 2. Colors

A restrained palette built around a single indigo primary and clean gray neutrals.

### Primary

- **Vivid Indigo** (#4F46E5 / oklch(0.528 0.216 278.6)): Primary actions — buttons, links, active stats, key interactive elements. This is the single voice of the system.
- **Deep Indigo** (#4338CA / oklch(0.446 0.208 280.9)): Hover state for primary actions.
- **Lavender Mist** (#EEF2FF / oklch(0.937 0.022 278.6)): Light tint used for info callouts, feedback panels, and non-interactive accent backgrounds.

### Neutral

- **Paper** (#FFFFFF): Surfaces — cards, input backgrounds, header.
- **Stone** (#F9FAFB / oklch(0.969 0.006 270)): Page background.
- **Slate 200** (#E5E7EB / oklch(0.924 0.009 270)): Subtle borders — table rows, card dividers.
- **Slate 300** (#D1D5DB / oklch(0.869 0.015 270)): Input borders at rest.
- **Muted Ink** (#6B7280 / oklch(0.558 0.017 270)): Secondary and placeholder text.
- **Ink** (#111827 / oklch(0.2 0.012 270)): Body text and headings.

### Accents

- **Moss** (#16A34A / oklch(0.516 0.194 146)): Audio score display; success/confirmation signals.
- **Honey** (#D97706 / oklch(0.618 0.131 78.7)): Combined/total score; warning attention.
- **Tomato** (#DC2626 / oklch(0.512 0.242 20)): Destructive actions (stop camera, stop listening); error messages.

### Named Rules

**The Single Voice Rule.** The primary indigo is used on <15% of any given screen. It's concentrated in actions and data points, never washed across backgrounds or decorative elements. Its restraint is the point.

**The Layered Neutral Rule.** Depth is communicated through surface lightness, not hue. Surfaces are white (`#FFFFFF`), page is `#F9FAFB`, and dividers/borders are `#E5E7EB`. No warm or cool tint in the neutrals — the brand lives in the accent, not the background.

## 3. Typography

**Display & Body Font:** Geist (variable sans-serif, with system-ui fallback)
**Mono Font:** Geist Mono (for code/reference values)

**Character:** Geist is a clean, confident geometric sans with a warm but precise personality. Its variable weight axis gives flexibility without introducing a second typeface — one family, many voices.

### Hierarchy

- **Display** (700, clamp(1.875rem, 5vw, 3rem), 1.1, -0.03em): The practice word on the practice page. Large, commanding, centered. The hero element of the session.
- **Headline** (600, clamp(1.25rem, 3vw, 1.5rem), 1.2, -0.02em): Section titles on dashboard. Bold enough to structure the page.
- **Title** (600, 1.125rem, 1.3): Card headers, panel titles.
- **Body** (400, 0.9375rem, 1.6): Paragraph text, descriptions. Max line length 65–75ch. Softened weight for comfortable reading.
- **Label** (500, 0.875rem, 1.3): Form labels, table headers, stat descriptions, button text. Medium weight for legibility at small sizes.

### Named Rules

**The Size Discretion Rule.** Use display size only for the practice word. Dashboard headings use headline or title. The hierarchy reflects information priority, not a desire to fill space.

**Text-wrap balance.** All h1–h3 use `text-wrap: balance`. Body text uses `text-wrap: pretty` to reduce orphans.

## 4. Elevation

Shadow-forward but deliberately restrained. Surfaces float with a gentle lift that signals interactivity without recreating Material Design. The system uses three distinct shadow levels.

### Shadow Vocabulary

- **ambient-low** (`0 1px 2px rgba(0,0,0,0.04)`): Default surface state — subtle separation for cards, containers at rest.
- **ambient-mid** (`0 4px 16px rgba(0,0,0,0.08)`): Elevated surfaces — auth card, dropdown, modal. Enough lift to clearly float above the page.
- **ambient-high** (`0 8px 24px rgba(0,0,0,0.12)`): Interactive hover state — buttons and cards on hover. The highest lift in the system.

### Named Rules

**The Flat-At-Rest Rule.** All surfaces are at `ambient-low` by default. Elevation to `ambient-mid` or `ambient-high` is a response to state — hover, focus, or an intentionally framed container like the auth card. The resting state is nearly flat.

**No Shadow On Background.** Shadows only appear on interactive or content surfaces (cards, buttons, modals). The page background (`#F9FAFB`) and structural chrome (header, navigation) never receive shadows or drop shadows.

## 5. Components

### Buttons

- **Shape:** Gently rounded (8px radius). Confident but not aggressive.
- **Primary:** Vivid Indigo fill, white text, `12px 24px` padding. On hover, Deep Indigo (`#4338CA`) with a `translateY(-1px)` lift at `ambient-high`.
- **Danger:** Tomato fill, white text, `8px 16px` padding. Used for stop actions and destructive controls.
- **Ghost/Text:** No background, no border. Muted Ink text, Deep Indigo on hover. For secondary navigation (back links, toggle auth mode).
- **Transition:** `background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease` for all filled buttons.

### Cards / Containers

- **Corner Style:** Soft rounded (12px for standard cards, 16px for the auth card).
- **Background:** White (`#FFFFFF`).
- **Shadow:** `ambient-low` at rest.
- **Border:** None on cards. A `border-bottom: 1px solid #E5E7EB` on table rows within cards.
- **Internal Padding:** 24px standard, 32px for auth card, 16px for compact history items.

### Inputs / Fields

- **Style:** Clean bordered. `1px solid #D1D5DB` border, white fill, 8px radius, `10px 16px` padding.
- **Focus:** Border shifts to Vivid Indigo (`#4F46E5`) with a `ring-2` glow (`box-shadow: 0 0 0 2px rgba(79,70,229,0.2)`). No outline.
- **Placeholder:** `#6B7280` (4.5:1 minimum contrast against white — no light gray placeholders).
- **Error:** Border shifts to Tomato (`#DC2626`). No layout shift on error — reserve space for the error message.

### Navigation

- **Header bar:** White background, `border-bottom: 1px solid #E5E7EB` for subtle separation, no shadow.
- **Left side:** App name in Display or Headline weight. Right side: account actions (logout, settings).
- **Mobile:** For the current surface count (2–3 nav items), inline layout is sufficient.

### Badges / Chips

- **Style:** Pill shape (`rounded-full`), Lavender Mist (`#EEF2FF`) background, Deep Indigo text, `3px 12px` padding.
- **Content:** Viseme group labels, difficulty indicators. Non-interactive.

### Stats / Metric Displays

- **Layout:** Three-column grid on dashboard. Each stat is a white card with label (Label weight, Muted Ink) and value (Display weight, Vivid Indigo).
- **Shape:** Soft rounded (12px), `ambient-low` shadow, 24px internal padding.

## 6. Do's and Don'ts

### Do:

- **Do** keep the practice page minimal — one word, the camera view, and controls. The learner's face is the content.
- **Do** use `text-wrap: balance` on h1–h3 for even line lengths.
- **Do** use Vivid Indigo sparingly. It marks primary actions and data highlights only.
- **Do** use Soft & Friendly radii — 8px for buttons and inputs, 12–16px for cards.
- **Do** keep body text at ≥4.5:1 contrast ratio.
- **Do** use `border-bottom: 1px solid #E5E7EB` for table row separation. Full borders on every cell are too heavy.
- **Do** reserve `translateY(-1px)` + shadow elevation for interactive hover states.

### Don't:

- **Don't** clutter the dashboard. Three stat cards, one table, one history list — no more. Anti-reference: cluttered UIs where the learner feels buried in data.
- **Don't** use indigo as a background wash or page section color. The accent is for actions and highlights, not for surfaces.
- **Don't** animate layout properties (width, height, top, left). Use transform and opacity.
- **Don't** use glassmorphism, gradient text, or decorative blur. Those are never part of this system.
- **Don't** pair a border with a wide shadow (`border: 1px solid X` + `box-shadow` with blur ≥16px). Pick one per surface.
- **Don't** skip reduced motion. Every animation needs an `@media (prefers-reduced-motion: reduce)` alternative.
- **Don't** use skeleton screens or loading spinners as default loading states. A simple centered text status (Thai, friendly) is cleaner for focused flows.
