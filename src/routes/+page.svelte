<script lang="ts">
  import SiteHeader from "$lib/components/site-header.svelte";
  import SiteFooter from "$lib/components/site-footer.svelte";
  import FeaturedHero from "$lib/components/featured-hero.svelte";
  import ChartSection from "$lib/components/chart-section.svelte";
  import ChartSkeleton from "$lib/components/chart-skeleton.svelte";

  let { data } = $props();
</script>

<svelte:head>
  <title>UntitledCharts | Sonolus chart catalog</title>
  <meta
    name="description"
    content="Browse, rank, and discover Sonolus rhythm-game fan-charts from the community."
  />
</svelte:head>

{#snippet skeletonRow(title: string)}
  <section class="space-y-5">
    <h2 class="font-heading text-lg font-semibold tracking-tight">{title}</h2>
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {#each Array(4) as _, i (i)}
        <div class={i >= 2 ? "hidden lg:block" : i >= 1 ? "hidden sm:block" : ""}>
          <ChartSkeleton />
        </div>
      {/each}
    </div>
  </section>
{/snippet}

<SiteHeader />

<main class="mx-auto max-w-7xl space-y-14 px-4 py-10 sm:px-6">
  <FeaturedHero charts={data.featured} />

  <ChartSection title="Staff picks" charts={data.staffPicks} href="/browse?staff=1" carousel />

  {#await data.trending}
    {@render skeletonRow("Trending now")}
  {:then trending}
    <ChartSection title="Trending now" charts={trending} href="/browse" carousel />
  {/await}

  {#await data.newest}
    {@render skeletonRow("New on UNCH")}
  {:then newest}
    <ChartSection
      title="New on UNCH"
      charts={newest}
      href="/browse?sort=created_at:desc"
      hrefLabel="See newest"
    />
  {/await}
</main>

<SiteFooter />
