# Product

## Register

product

## Users

Sonolus rhythm-game players and chart creators ("charters"). They arrive to **discover and browse
community fan-charts**, inspect a chart's difficulty/tags/activity, read its comments, study its
score leaderboards, and follow the creators they like. They are fluent in rhythm-game conventions
(difficulty tiers like EXPERT/MASTER/APPEND, FC/AP grades, judgment windows) and scan quickly across
many items. The actual playing happens in the Sonolus client elsewhere; this is the web catalog.

## Product Purpose

A fast, attractive web front-end for the UntitledCharts catalog: browse feeds (staff picks, trending,
new), filter/sort the full library, open a chart to see its details + trends + leaderboards +
comments, and explore creator profiles. Success = a visitor effortlessly finds charts worth playing
and trusts the numbers on screen. This build is a **no-backend demo** powered by mock data shaped
exactly to the real API; it deliberately shows only what the API actually returns.

## Brand Personality

Vivid, playful, clean. Neon-violet energy (the rhythm-game/PJSK world) carried with product
restraint — color and motion serve the content, never crowd it. Three words: **electric, crisp,
trustworthy.**

## Anti-references

- Generic blue/gray SaaS admin dashboard (no personality).
- "Gamer RGB" clutter — rainbow gradients, neon everything, busy backgrounds.
- Cream/editorial/magazine warmth (wrong world entirely).
- Fabricated stats or fake controls that imply data/actions the API can't back.

## Design Principles

- **The charts are the hero.** Cover art, title, difficulty and creator lead; chrome recedes.
- **Honest to the data.** Only surface fields the API returns; never invent plays/BPM/notes or fake
  auth-gated actions. Missing data is omitted, not faked.
- **Earned familiarity.** Standard nav, tabs, tables, pagination — the tool disappears into the task.
- **Vivid but restrained.** One violet accent for actions/selection/identity; difficulty palette is
  the one place saturated color is allowed to carry meaning.
- **Dense where it helps.** Leaderboards and browse lists run information-dense; feeds breathe.

## Accessibility & Inclusion

WCAG AA contrast on all text and controls; full keyboard navigation with visible focus rings; light
and dark themes; `prefers-reduced-motion` honored on every transition; difficulty never encoded by
color alone (always paired with its label).
