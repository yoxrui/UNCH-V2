<script lang="ts">
  import SiteHeader from "$lib/components/site-header.svelte";
  import SiteFooter from "$lib/components/site-footer.svelte";
  import RankingCard from "$lib/components/ranking-card.svelte";
  import { cn } from "$lib/utils.js";
  import { LEADERBOARD_TYPES, leaderboardMeta, type LeaderboardType } from "$lib/data/index.js";
  import { RiTrophyLine } from "$lib/icons.js";

  let { data } = $props();
  let lbType = $state<LeaderboardType>("arcade_score_speed");
</script>

<svelte:head>
  <title>Rankings — UntitledCharts</title>
</svelte:head>

<SiteHeader />

<main class="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
  <header class="space-y-1">
    <h1 class="font-heading inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
      <RiTrophyLine class="size-6 text-amber-500" /> Rankings
    </h1>
    <p class="text-muted-foreground text-sm">
      Top scores per chart. Pick a leaderboard type, then open a chart for the full board.
    </p>
  </header>

  <!-- Leaderboard type selector -->
  <div class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
    {#each LEADERBOARD_TYPES as t (t)}
      <button
        type="button"
        onclick={() => (lbType = t)}
        aria-pressed={lbType === t}
        class={cn(
          "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
          lbType === t
            ? "bg-primary text-primary-foreground border-transparent"
            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
        )}
      >
        {leaderboardMeta[t].short}
      </button>
    {/each}
  </div>

  <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
    {#each data.charts as chart (chart.id)}
      <RankingCard {chart} {lbType} />
    {/each}
  </div>
</main>

<SiteFooter />
