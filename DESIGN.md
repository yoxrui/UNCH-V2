# Design

Visual system for the UntitledCharts frontend. Tokens live in [src/app.css](src/app.css) (Tailwind
v4, CSS-variable theme). This file documents intent; `app.css` is the source of truth.

## Color

OKLCH throughout. Single accent strategy (**Restrained**): one violet primary carries actions,
selection, and identity. Hue ~262 across the ramp.

- **Primary / accent:** violet — `--primary` (`oklch(0.457 0.24 262)` light, `0.398 0.195 262` dark).
  Used for primary buttons, active nav, links-as-action, current selection. Charter links use
  **sky-400** as a secondary "person" color (existing convention).
- **Surfaces:** `--background` near-white (light) / deep violet-black (dark); `--card`, `--popover`,
  `--muted`, `--secondary` are tinted neutrals toward hue 262. `--sidebar*` is the cooler panel layer.
- **Featured:** dedicated `--featured` / `--featured-foreground` (cyan-tinted) for the hero card only.
- **Charts (data-viz):** `--chart-1…5` is a violet ramp — used by the trends graph.
- **Semantic state:** `--destructive`, `--ring` (focus), plus per-difficulty colors below.
- Contrast: body text ≥ 4.5:1, large/bold ≥ 3:1, in both themes. Muted text only for genuinely
  secondary metadata.

### Difficulty palette (meaning-carrying)

Canonical tiers map to fixed colors (badge / dot / ring), reused everywhere a difficulty appears:

| Tier | Hue |
|---|---|
| EASY | emerald | NORMAL | sky | HARD | amber | EXPERT | rose | MASTER | fuchsia | APPEND | pink→purple gradient |

Difficulty is **always shown with its label**, never color-only. Staff picks use amber; likes use
rose; the per-chart gradient cover art is a deterministic placeholder keyed off the chart id.

## Typography

- **Headings:** `Instrument Sans Variable` (`--font-heading`).
- **Body / UI:** `Roboto Variable` (`--font-sans`). `Geist Variable` is available.
- Product scale: fixed rem steps (not fluid), tight ratio (~1.2). `tabular-nums` for all stats,
  scores, counts. Truncate long titles; `text-wrap: balance` on page headings.

## Layout & shape

- **Radius:** generous — base `--radius: 0.875rem`, plus `rounded-2xl/3xl` for cards/heroes and
  `rounded-full` for pills/the header island.
- **Shell:** floating glassy pill **`site-header`** (sticky, `backdrop-blur`, `max-w-5xl`), content in
  centered `max-w-5xl`–`7xl` mains; a simple footer.
- Responsive is **structural** (grid column counts, list↔grid toggle, nav collapse), not fluid type.
  Auto-fit grids where item-count varies.

## Components

shadcn-svelte (Bits UI) is the component vocabulary — `Card`, `Badge`, `Button`, `Select`, `Tabs`,
`Pagination`, `Avatar`, `Skeleton`, `Tooltip`, `Separator`, and `ui/chart` (LayerChart) for trends.
Every interactive element ships default/hover/focus/active states; lists get **skeleton** loading and
teaching **empty** states. Cards lift subtly on hover (`-translate-y-1`, ring highlight). Same button
shape and icon set (`remixicon-svelte`) across all screens.

## Motion

150–250 ms, ease-out; motion conveys state (hover, selection, tab/page change, reveal) — never
decoration. Featured hero auto-advances as a carousel. All transitions have a
`prefers-reduced-motion: reduce` fallback (crossfade/instant). No page-load choreography.
