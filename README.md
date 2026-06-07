# Dashboard Template

A ready-to-go dashboard boilerplate built with **Svelte 5**, **SvelteKit 2**, **Tailwind CSS v4**, and **shadcn-svelte** — all pre-configured and wired up. Clone, install, and start building; no setup wrangling required.

## What's included

- **Svelte 5** (runes) + **SvelteKit 2**
- **Tailwind CSS v4** (configured in CSS via `@tailwindcss/vite` — no `tailwind.config`)
- **shadcn-svelte v1** components in `src/lib/components/ui/` (Bits UI primitives)
- **Dark mode** out of the box via `mode-watcher`
- **Icons** via `remixicon-svelte`
- **Toasts** via `svelte-sonner`
- **Bun** as the package manager / runner

## Getting started

```sh
bun install
bun run dev
```

Then open http://localhost:5173.

## Commands

```sh
bun run dev        # start the dev server
bun run build      # production build
bun run preview    # preview the production build
bun run check      # type-check with svelte-check
```

## Adding components

Use the shadcn-svelte CLI rather than hand-writing component files:

```sh
bunx shadcn-svelte@latest add <component>   # add one or more
bunx shadcn-svelte@latest add --all --yes   # add everything
```

## Project structure

```
src/
  app.css                  # Tailwind v4 entry + theme tokens (CSS variables)
  routes/                  # SvelteKit routes
  lib/
    components/ui/         # shadcn-svelte components
    utils.ts               # cn() helper
```

## Theming

Theme colors are CSS variables defined under `:root` / `.dark` in `src/app.css` and mapped to
Tailwind utilities in the `@theme inline` block. Edit the variables there to recolor the app;
dark mode is class-based and toggled by `ModeWatcher`.

## Deploying

This template uses `@sveltejs/adapter-auto`. For a specific host, install the matching
[SvelteKit adapter](https://svelte.dev/docs/kit/adapters) and update `svelte.config.js`.
