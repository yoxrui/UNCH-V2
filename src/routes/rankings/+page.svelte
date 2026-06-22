<script lang="ts">
  import SiteHeader from "$lib/components/site-header.svelte";
  import SiteFooter from "$lib/components/site-footer.svelte";
  import CoverArt from "$lib/components/cover-art.svelte";
  import DifficultyBadge from "$lib/components/difficulty-badge.svelte";
  import { cn } from "$lib/utils.js";
  import {
    getLeaderboard,
    difficultyFromTags,
    grouped,
    LEADERBOARD_TYPES,
    leaderboardMeta,
    type LeaderboardType,
    type ScoreEntry,
  } from "$lib/data/index.js";
  import { RiTrophyLine, RiArrowRightLine } from "remixicon-svelte";

  let { data } = $props();
  let lbType = $state<LeaderboardType>("arcade_score_speed");

  function primaryFor(e: ScoreEntry, type: LeaderboardType): string {
    switch (type) {
      case "accuracy_score":
        return grouped(e.accuracy_score);
      case "least_combo_breaks":
        return `${e.ngood + e.nmiss} breaks`;
      case "least_misses":
        return `${e.nmiss} miss`;
      case "perfect":
        return `${grouped(e.nperfect)} P`;
      default:
        return grouped(e.arcade_score);
    }
  }

  const medal = ["text-amber-500", "text-slate-400", "text-orange-500"];
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
      {@const board = getLeaderboard(chart.id, lbType, 0, 3)}
      {@const difficulty = difficultyFromTags(chart.tags, chart.rating)}
      <article
        class="group bg-card hover:ring-primary/40 relative flex flex-col gap-3 rounded-2xl p-4 ring-1 ring-border/70 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <div class="flex items-center gap-3">
          <CoverArt id={chart.id} title={chart.title} class="size-12" />
          <div class="min-w-0 flex-1">
            <h2 class="truncate font-semibold tracking-tight">
              <a
                href={`/levels/${chart.id}`}
                class="hover:text-primary after:absolute after:inset-0 after:content-['']"
                >{chart.title}</a
              >
            </h2>
            <p class="text-muted-foreground truncate text-xs">{chart.artists}</p>
          </div>
          <DifficultyBadge {difficulty} level={chart.rating} size="sm" />
        </div>

        {#if board.data.length === 0}
          <p class="text-muted-foreground/70 rounded-lg border border-dashed py-4 text-center text-xs">
            No scores yet
          </p>
        {:else}
          <ol class="divide-border/50 divide-y">
            {#each board.data as e, i (e.id)}
              <li class="flex items-center gap-2.5 py-1.5 text-sm">
                <span class={cn("w-4 text-center text-xs font-bold tabular-nums", medal[i])}>
                  {i + 1}
                </span>
                <span class="min-w-0 flex-1 truncate">{e.account.sonolus_username}</span>
                <span class="text-muted-foreground shrink-0 text-xs font-semibold tabular-nums">
                  {primaryFor(e, lbType)}
                </span>
              </li>
            {/each}
          </ol>
        {/if}

        <span
          class="text-muted-foreground/70 group-hover:text-primary inline-flex items-center gap-1 text-xs transition-colors"
        >
          Full board
          <RiArrowRightLine class="size-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" />
        </span>
      </article>
    {/each}
  </div>
</main>

<SiteFooter />
