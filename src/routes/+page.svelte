<script lang="ts">
  import SiteHeader from "$lib/components/site-header.svelte";
  import SiteFooter from "$lib/components/site-footer.svelte";
  import FeaturedHero from "$lib/components/featured-hero.svelte";
  import ChartSection from "$lib/components/chart-section.svelte";
  import ChartCard from "$lib/components/chart-card.svelte";
  import ChartListCard from "$lib/components/chart-list-card.svelte";
  import { RiArrowRightLine } from "$lib/icons.js";

  let { data } = $props();
</script>

<svelte:head>
  <title>UntitledCharts | Sonolus chart catalog</title>
  <meta
    name="description"
    content="Browse, rank, and discover Sonolus rhythm-game fan-charts from the community."
  />
</svelte:head>

<SiteHeader />

<main class="mx-auto max-w-7xl space-y-14 px-4 py-10 sm:px-6">
  <FeaturedHero charts={data.featured} />

  <ChartSection title="Staff picks" charts={data.staffPicks} href="/browse?staff=1" carousel />

  <ChartSection title="Trending now" charts={data.trending} href="/browse" carousel />

  <ChartSection
    title="New on UNCH"
    charts={data.newest}
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

    <!-- Mobile: compact list -->
    <div class="space-y-2.5 sm:hidden">
      {#each data.charts as chart (chart.id)}
        <ChartListCard {chart} />
      {/each}
    </div>
    <!-- Desktop: grid -->
    <div class="hidden gap-5 sm:grid sm:grid-cols-2 lg:grid-cols-3">
      {#each data.charts as chart (chart.id)}
        <ChartCard {chart} />
      {/each}
    </div>
  </section>
</main>

<SiteFooter />
