<script lang="ts">
  import SiteHeader from "$lib/components/site-header.svelte";
  import SiteFooter from "$lib/components/site-footer.svelte";
  import CoverArt from "$lib/components/cover-art.svelte";
  import ChartCard from "$lib/components/chart-card.svelte";
  import ChartSkeleton from "$lib/components/chart-skeleton.svelte";
  import FormattedText from "$lib/components/formatted-text.svelte";
  import { cn } from "$lib/utils.js";
  import { compact, plural, bannerGradient, profileUrl, bannerUrl } from "$lib/data/index.js";
  import { RiArrowLeftLine, RiHeart3Fill, RiStackLine, RiStarFill } from "$lib/icons.js";

  let { data } = $props();
  const account = $derived(data.account);
</script>

<svelte:head>
  <title>{account.sonolus_username} | UntitledCharts</title>
</svelte:head>

<SiteHeader />

<main class="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
  <a
    href="/creators"
    class="text-muted-foreground hover:text-foreground group inline-flex items-center gap-1.5 text-sm transition-colors"
  >
    <RiArrowLeftLine class="size-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none" />
    Creators
  </a>

  <!-- Profile header -->
  <section class="bg-card overflow-hidden rounded-3xl border">
    <div class="relative">
      {#if bannerUrl(account)}
        <div
          class="h-28 bg-cover bg-center sm:h-32"
          style="background-image: url({bannerUrl(account)})"
        ></div>
      {:else}
        <div class={cn("h-28 bg-linear-to-br sm:h-32", bannerGradient(account.sonolus_id))}></div>
      {/if}
      <div
        class="pointer-events-none absolute inset-x-0 bottom-0 h-12 backdrop-blur-md"
        style="mask-image: linear-gradient(to top, black, transparent); -webkit-mask-image: linear-gradient(to top, black, transparent);"
      ></div>
      <div
        class="from-card pointer-events-none absolute inset-x-0 bottom-0 hidden h-20 bg-linear-to-t to-transparent sm:block"
      ></div>
    </div>
    <div class="relative z-10 -mt-12 flex flex-col gap-4 px-4 pb-5 sm:flex-row sm:items-end sm:px-6">
      <CoverArt
        id={account.sonolus_id}
        title={account.sonolus_username}
        src={profileUrl(account)}
        rounded="rounded-2xl"
        class="ring-card size-24 text-3xl ring-4"
      />
      <div class="flex min-w-0 flex-1 flex-col gap-2 pb-1 sm:pb-2">
        <div class="flex flex-wrap items-center gap-2">
          <h1 class="font-heading text-2xl font-bold tracking-tight">
            <FormattedText text={account.sonolus_username} />
          </h1>
          <span class="text-muted-foreground/70 text-sm tabular-nums">#{account.sonolus_handle}</span>
          {#if account.admin}
            <span
              class="rounded border border-rose-400/40 bg-rose-400/15 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-300"
              >ADMIN</span
            >
          {:else if account.mod}
            <span
              class="rounded border border-violet-400/40 bg-violet-400/15 px-1.5 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-300"
              >MOD</span
            >
          {/if}
        </div>
        {#if account.description}
          <p class="text-muted-foreground max-w-2xl text-sm leading-relaxed">
            <FormattedText text={account.description} />
          </p>
        {/if}
        {#await data.charts}
          <div class="bg-muted h-5 w-40 animate-pulse rounded"></div>
        {:then charts}
          {@const totalLikes = charts.reduce((sum, c) => sum + c.like_count, 0)}
          {@const staffPicks = charts.filter((c) => c.staff_pick).length}
          <div class="text-muted-foreground flex items-center gap-4 text-sm tabular-nums">
            <span class="inline-flex items-center gap-1.5">
              <RiStackLine class="size-4" /><span class="text-foreground font-semibold"
                >{charts.length}</span
              > {plural(charts.length, "chart")}
            </span>
            <span class="inline-flex items-center gap-1.5">
              <RiHeart3Fill class="size-4 text-rose-400" /><span class="text-foreground font-semibold"
                >{compact(totalLikes)}</span
              > {plural(totalLikes, "like")}
            </span>
            {#if staffPicks > 0}
              <span class="inline-flex items-center gap-1.5 text-amber-500">
                <RiStarFill class="size-4" />{staffPicks} staff
              </span>
            {/if}
          </div>
        {/await}
      </div>
    </div>
  </section>

  <!-- Their charts -->
  <section class="space-y-4">
    <h2 class="font-heading text-lg font-semibold tracking-tight">Charts</h2>
    {#await data.charts}
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {#each Array(6) as _, i (i)}
          <ChartSkeleton />
        {/each}
      </div>
    {:then charts}
      {#if charts.length}
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {#each charts as chart (chart.id)}
            <ChartCard {chart} />
          {/each}
          <a
            href={`/browse?sonolus_handle_is=${account.sonolus_handle}`}
            class="bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted grid min-h-44 place-items-center rounded-2xl border border-dashed transition-colors"
          >
            <span class="font-heading text-base font-semibold">View All</span>
          </a>
        </div>
      {:else}
        <p class="text-muted-foreground rounded-2xl border border-dashed py-16 text-center text-sm">
          No public charts yet.
        </p>
      {/if}
    {/await}
  </section>
</main>

<SiteFooter />
