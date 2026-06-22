<script lang="ts">
  import SiteHeader from "$lib/components/site-header.svelte";
  import SiteFooter from "$lib/components/site-footer.svelte";
  import FeaturedHero from "$lib/components/featured-hero.svelte";
  import ChartSection from "$lib/components/chart-section.svelte";
  import ChartCard from "$lib/components/chart-card.svelte";
  import ChartListCard from "$lib/components/chart-list-card.svelte";
  import { cn } from "$lib/utils.js";
  import {
    featuredCharts,
    staffPicks,
    trending,
    newest,
    charts,
    DIFFICULTIES,
    difficultyMeta,
    difficultyFromTags,
    type Difficulty,
  } from "$lib/data/index.js";
  import { RiArrowRightLine } from "remixicon-svelte";
  import { flip } from "svelte/animate";
  import { fade } from "svelte/transition";

  let activeDifficulty = $state<Difficulty | null>(null);

  const allCharts = $derived(
    activeDifficulty
      ? charts.filter((c) => difficultyFromTags(c.tags, c.rating) === activeDifficulty)
      : charts,
  );

  function toggle(d: Difficulty) {
    activeDifficulty = activeDifficulty === d ? null : d;
  }
</script>

<svelte:head>
  <title>UntitledCharts — Sonolus chart catalog</title>
  <meta
    name="description"
    content="Browse, rank, and discover Sonolus rhythm-game fan-charts from the community."
  />
</svelte:head>

<SiteHeader />

<main class="mx-auto max-w-7xl space-y-14 px-4 py-10 sm:px-6">
  <FeaturedHero charts={featuredCharts} />

  <ChartSection title="Staff picks" charts={staffPicks.slice(0, 8)} href="/browse?staff=1" carousel />

  <ChartSection title="Trending now" charts={trending} href="/browse" carousel />

  <ChartSection
    title="New on UNCH"
    charts={newest}
    href="/browse?sort=created_at:desc"
    hrefLabel="See newest"
  />

  <section class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h2 class="font-heading text-lg font-semibold tracking-tight">All of UNCH</h2>
      <a
        href="/browse"
        class="text-muted-foreground hover:text-foreground group inline-flex items-center gap-1 text-sm transition-colors"
      >
        Open browser
        <RiArrowRightLine
          class="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
        />
      </a>
    </div>

    <!-- Difficulty filter -->
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-muted-foreground text-sm">Difficulty</span>
      {#each DIFFICULTIES as d (d)}
        {@const active = activeDifficulty === d}
        {@const meta = difficultyMeta[d]}
        <button
          type="button"
          onclick={() => toggle(d)}
          aria-pressed={active}
          class={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
            active
              ? meta.badge
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
          )}
        >
          <span class={cn("size-1.5 rounded-full", active ? meta.dot : "bg-muted-foreground/50")}
          ></span>
          {d}
        </button>
      {/each}
    </div>

    {#if allCharts.length}
      <!-- Mobile: compact list -->
      <div class="space-y-2.5 sm:hidden">
        {#each allCharts as chart (chart.id)}
          <div animate:flip={{ duration: 250 }} in:fade={{ duration: 180 }}>
            <ChartListCard {chart} />
          </div>
        {/each}
      </div>
      <!-- Desktop: grid -->
      <div class="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
        {#each allCharts as chart (chart.id)}
          <div animate:flip={{ duration: 250 }} in:fade={{ duration: 180 }}>
            <ChartCard {chart} />
          </div>
        {/each}
      </div>
    {:else}
      <p
        class="text-muted-foreground rounded-2xl border border-dashed py-16 text-center text-sm"
      >
        No {activeDifficulty} charts in the catalog yet.
      </p>
    {/if}
  </section>
</main>

<SiteFooter />
