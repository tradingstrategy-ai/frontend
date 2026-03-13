# Theme reference

This document describes the frontend theme system as implemented in code today.

It is written primarily for LLM consumption. When generating or editing UI in this repository, prefer this document over inventing new visual rules.

## Scope

- The frontend uses semantic CSS custom properties as design tokens.
- The active CSS token bundle is imported from `src/lib/components/css/index.css`.
- Dark mode is the default.
- Light mode is supported through the same semantic token names.
- Theme resolution is handled on the server and applied to the root HTML element.

## Primary source files

These files are the main source of truth for theme behaviour:

- `src/lib/components/css/index.css`: imports the active token layers.
- `src/lib/components/css/color.css`: semantic colours, dark mode, light mode.
- `src/lib/components/css/space.css`: spacing scale.
- `src/lib/components/css/radius.css`: global radius scale.
- `src/lib/components/css/radius-new.css`: newer radius scale under `.ds-3`.
- `src/lib/components/css/typography.css`: legacy but active typography tokens.
- `src/lib/components/css/typography-new.css`: newer typography tokens under `.ds-3`.
- `src/lib/components/css/breakpoints.css`: shared responsive breakpoints.
- `docs/architecture.md`: colour mode behaviour and theming flow.

## Theme model

- Prefer semantic tokens such as `--c-text-light`, `--c-box-2`, or `--f-heading-xl-medium`.
- Avoid hard-coded HEX, RGB, or HSL values unless there is a strong reason.
- The system is warm-neutral rather than blue-neutral.
- Green and red are semantic accents for positive and negative values, not general branding colours.
- Most surfaces are translucent or token-derived rather than flat solid blocks.

## Colour system

### Base hues

Defined in `src/lib/components/css/color.css`:

- `--hue-1: 36`
- `--hue-2: 60`
- `--hue-bullish: 140`
- `--hue-bearish: 0`

Interpretation:

- `--hue-1` and `--hue-2` drive the warm neutral palette.
- `--hue-bullish` drives positive/green accents.
- `--hue-bearish` drives negative/red accents.

### Shared semantic colours

These do not change between themes:

- `--c-console: hsl(120 93% 79%)`
- `--c-error: hsl(358 56% 55%)`
- `--c-success: hsl(149 64% 44%)`
- `--c-warning: hsl(43 92% 50%)`

### Dark mode colours

Dark mode is the default:

- `--c-body: hsl(var(--hue-2) 2% 10%)`
- `--c-text: hsl(var(--hue-1) 12% 99%)`
- `--c-text-light: hsl(var(--hue-1) 4% 88%)`
- `--c-text-extra-light: hsl(var(--hue-1) 3% 64%)`
- `--c-text-ultra-light: hsl(var(--hue-1) 2% 36%)`
- `--c-text-inverted: hsl(var(--hue-1) 9% 7%)`
- `--c-bullish: hsl(var(--hue-bullish) 68% 42%)`
- `--c-bearish: hsl(var(--hue-bearish) 92% 72%)`
- `--c-background-accent-1: hsl(0 0% 0% / 20%)`

Dark mode box surface values are derived from:

- `--hsl-box: var(--hue-1) 2% 92%`
- `--box-1-alpha: 5%`
- `--box-2-alpha: 8%`
- `--box-3-alpha: 14%`
- `--box-4-alpha: 20%`

Resulting semantic surface tokens:

- `--c-box-1`
- `--c-box-2`
- `--c-box-3`
- `--c-box-4`

Practical use in dark mode:

- `--c-box-1`: lightest elevated surface.
- `--c-box-2`: normal panel fill.
- `--c-box-3`: stronger panel or border colour.
- `--c-box-4`: heaviest neutral emphasis.

### Light mode colours

Light mode keeps the same semantic token names and swaps the neutral values:

- `--c-body: hsl(var(--hue-1) 100% 96%)`
- `--c-text: hsl(var(--hue-1) 9% 7%)`
- `--c-text-light: hsl(var(--hue-1) 4% 24%)`
- `--c-text-extra-light: hsl(var(--hue-1) 6% 56%)`
- `--c-text-ultra-light: hsl(var(--hue-1) 12% 68%)`
- `--c-text-inverted: hsl(var(--hue-2) 20% 99%)`
- `--c-bullish: hsl(var(--hue-bullish) 68% 42%)`
- `--c-bearish: hsl(var(--hue-bearish) 92% 57%)`
- `--c-background-accent-1: var(--c-box-2)`

Light mode box surface inputs:

- `--hsl-box: var(--hue-1) 32% 72%`
- `--box-1-alpha: 12%`
- `--box-2-alpha: 24%`
- `--box-3-alpha: 36%`
- `--box-4-alpha: 48%`

## Colour usage guidance

Use these defaults when generating new UI:

- Page background: `var(--c-body)`
- Primary text: `var(--c-text)`
- Secondary text: `var(--c-text-light)`
- Muted metadata: `var(--c-text-extra-light)`
- Very subtle text or separators: `var(--c-text-ultra-light)`
- Text on solid dark buttons or inverted surfaces: `var(--c-text-inverted)`
- Positive values, gains, upward metrics: `var(--c-bullish)`
- Negative values, losses, downward metrics: `var(--c-bearish)`
- Base elevated card fill: `var(--c-box-1)`
- Stronger card or hover fill: `var(--c-box-2)`
- Default card border: `var(--c-box-3)`
- Stronger border or control emphasis: `var(--c-box-4)`
- Section accent wash: `var(--c-background-accent-1)`

Avoid these mistakes:

- Do not default to purple gradients.
- Do not introduce bright cyan as a primary accent unless the surrounding UI already does so.
- Do not use raw black or white where a semantic token exists.
- Do not treat `--c-bullish` as a general-purpose brand colour for all controls.

## Typography

Two typography layers are active.

### Global active layer

Defined in `src/lib/components/css/typography.css` and used widely across the current codebase.

Font families:

- `--ff-display`: `Neue Haas Grotesk Display`, system-ui, sans-serif
- `--ff-ui`: `Neue Haas Grotesk Text`, system-ui, sans-serif
- `--ff-text`: `Source Serif Pro`, serif
- `--ff-mono`: `Source Code Pro`, Menlo, Consolas, `DejaVu Sans Mono`, `Roboto Mono`, monospace

Common heading tokens:

- `--f-heading-xs-medium`: `600 19px/24px var(--ff-display)`
- `--f-heading-sm-medium`: `600 22px/28px var(--ff-display)`
- `--f-heading-md-medium`: `600 26px/36px var(--ff-display)`
- `--f-heading-lg-medium`: `600 30px/40px var(--ff-display)`
- `--f-heading-xl-medium`: `600 38px/44px var(--ff-display)`
- `--f-heading-xxl-medium`: `600 44px/56px var(--ff-display)`
- `--f-heading-xxxl-medium`: `600 50px/64px var(--ff-display)`

Common UI tokens:

- `--f-ui-xs-roman`: `400 14px/16px var(--ff-ui)`
- `--f-ui-sm-medium`: `500 15px/20px var(--ff-ui)`
- `--f-ui-md-medium`: `500 17px/24px var(--ff-ui)`
- `--f-ui-lg-roman`: `400 18px/24px var(--ff-ui)`
- `--f-ui-xl-roman`: `400 20px/30px var(--ff-ui)`
- `--f-ui-xxl-roman`: `400 26px/36px var(--ff-ui)`

Other active tokens:

- `--f-text-*`: serif article text
- `--f-mono-*`: code and data text

### `.ds-3` layer

Defined in `src/lib/components/css/typography-new.css` and used in newer components scoped with `.ds-3`.

Important families:

- `--ff-heading`
- `--ff-paragraph`
- `--ff-article`
- `--ff-ui`
- `--ff-mono`

Important line heights:

- `--lh-display: 125%`
- `--lh-paragraph: 150%`
- `--lh-article: 175%`
- `--lh-ui: 125%`
- `--lh-mono: 175%`

The `.ds-3` layer uses rem-based sizes and more systematic naming. Prefer it only when the component already uses `.ds-3` tokens.

### Typography guidance

When generating UI:

- Use heading tokens for headings, not arbitrary font-size values.
- Use UI tokens for body, labels, buttons, and metadata.
- Use serif text tokens only for article-like content.
- Follow the local component convention: if a component already uses global `--f-heading-*` and `--f-ui-*` tokens, continue with those.
- If a component is scoped as `.ds-3`, prefer the newer `.ds-3` tokens.

## Spacing

Defined in `src/lib/components/css/space.css`.

Important spacing values:

- `--space-xxxs: 0.125rem`
- `--space-xxs: 0.25rem`
- `--space-xs: 0.375rem`
- `--space-sm: 0.625rem`
- `--space-md: 1rem`
- `--space-lg: 1.5rem`
- `--space-xl: 2rem`
- `--space-2xl: 2.25rem`
- `--space-3xl: 2.5rem`
- `--space-5xl: 3rem`
- `--space-7xl: 4rem`
- `--space-8xl: 5rem`
- `--space-10xl: 7.5rem`

Guidance:

- Use token spacing instead of ad hoc pixel values.
- `--space-sm` to `--space-md` is common for compact component padding.
- `--space-lg` to `--space-xl` is common for card padding and internal layout.
- `--space-3xl` and above is generally page-level spacing.

## Radius

Two radius layers exist.

### Global radius scale

Defined in `src/lib/components/css/radius.css`:

- `--radius-xxs: 0.375rem`
- `--radius-xs: 0.75rem`
- `--radius-sm: 1rem`
- `--radius-md: 1.25rem`
- `--radius-lg: 1.5rem`
- `--radius-xl: 1.75rem`
- `--radius-xxl: 2rem`

### `.ds-3` radius scale

Defined in `src/lib/components/css/radius-new.css`:

- `--radius-xs: 0.375rem`
- `--radius-ss: 0.5rem`
- `--radius-sm: 0.625rem`
- `--radius-sl: 0.75rem`
- `--radius-ms: 0.875rem`
- `--radius-md: 1rem`
- `--radius-ml: 1.125rem`
- `--radius-ls: 1.25rem`
- `--radius-lg: 1.5rem`
- `--radius-ll: 1.75rem`
- `--radius-xl: 2rem`

Guidance:

- Preserve the local radius system already used by the component.
- Larger hero or panel surfaces commonly use `--radius-md` through `--radius-xl`.

## Breakpoints

Defined in `src/lib/components/css/breakpoints.css`:

- `--viewport-xs`: `width <= 576px`
- `--viewport-sm-up`: `width > 576px`
- `--viewport-sm-down`: `width <= 768px`
- `--viewport-md-up`: `width > 768px`
- `--viewport-md-down`: `width <= 1024px`
- `--viewport-lg-up`: `width > 1024px`
- `--viewport-lg-down`: `width <= 1260px`
- `--viewport-xl-up`: `width > 1260px`
- `--viewport-xl-down`: `width <= 1440px`
- `--viewport-xxl`: `width > 1440px`

Navigation-specific breakpoints:

- `--nav-expanded`: `width >= 1050px`
- `--nav-collapsed`: `width < 1050px`

Guidance:

- Prefer these custom media queries instead of raw width values.
- Match the surrounding component's existing breakpoint usage.

## Colour mode behaviour

From `docs/architecture.md` and the active CSS:

- Dark/light mode is controlled via `data-color-mode` on the HTML element.
- The PostCSS dark-theme-class flow is used to support colour mode switching.
- Server-side rendering is used to avoid FOUC.
- Colour mode is stored in the `ts-color-mode` cookie.

## LLM implementation rules

If you are generating or editing UI in this repo:

- Prefer semantic tokens over literal values.
- Preserve the warm-neutral base palette.
- Use green and red as semantic gain/loss accents only.
- Use the spacing scale from `space.css`.
- Use typography tokens from the layer already used by the component.
- Use breakpoints from `breakpoints.css`.
- Assume dark mode first, but do not break light mode.
- Keep surfaces slightly translucent or token-derived rather than flat and stark.
- Avoid introducing a new design system inside an old component.

## Quick defaults

Use these defaults when there is no stronger local pattern:

- Page background: `var(--c-body)`
- Section wash: `var(--c-background-accent-1)`
- Card fill: `var(--c-box-1)`
- Hover or stronger card fill: `var(--c-box-2)`
- Card border: `var(--c-box-3)`
- Primary text: `var(--c-text)`
- Secondary text: `var(--c-text-light)`
- Muted text: `var(--c-text-extra-light)`
- Positive metric: `var(--c-bullish)`
- Negative metric: `var(--c-bearish)`
- Hero headline: `var(--f-heading-xxxl-medium)` or `var(--f-heading-xxl-medium)`
- Standard body copy: `var(--f-ui-md-roman)`
- Small labels: `var(--f-ui-sm-medium)`

## Notes

- `typography.css` contains deprecated aliases but still provides actively used tokens.
- `typography-new.css` and `radius-new.css` are newer token layers under `.ds-3`; they coexist with older global tokens.
- `color.css` is the primary source of truth for palette decisions.
