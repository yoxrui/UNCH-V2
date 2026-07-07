<script lang="ts">
  import CoverArt from "./cover-art.svelte";
  import DifficultyBadge from "./difficulty-badge.svelte";
  import FormattedText from "./formatted-text.svelte";
  import { cn } from "$lib/utils.js";
  import {
    fetchLeaderboard,
    difficultyFromTags,
    grouped,
    coverUrl,
    type Chart,
    type LeaderboardType,
    type ScoreEntry,
  } from "$lib/data/index.js";
  import { RiArrowRightLine } from "$lib/icons.js";

  let { chart, lbType }: { chart: Chart; lbType: LeaderboardType } = $props();

  const difficulty = $derived(difficultyFromTags(chart.tags, chart.rating));
  const medal = ["text-amber-500", "text-slate-400", "text-orange-500"];

  let entries = $state<ScoreEntry[]>([]);
  let loading = $state(true);
  let token = 0;
  $effect(() => {
    const type = lbType;
    const mine = ++token;
    loading = true;
    fetchLeaderboard(fetch, chart.id, type, 0, 3).then((r) => {
      if (mine !== token) return;
      entries = r.data;
      loading = false;
    });
  });

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
</script>

<article
  class="group bg-card hover:ring-primary/40 relative flex flex-col gap-3 rounded-2xl p-4 ring-1 ring-border/70 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
>
  <div class="flex items-center gap-3">
    <CoverArt id={chart.id} title={chart.title} src={coverUrl(chart)} class="size-12" />
    <div class="min-w-0 flex-1">
      <h2 class="truncate font-semibold tracking-tight">
        <a
          href={`/levels/UnCh-${chart.id}`}
          class="hover:text-primary after:absolute after:inset-0 after:content-['']"
          ><FormattedText text={chart.title} /></a
        >
      </h2>
      <p class="text-muted-foreground truncate text-xs"><FormattedText text={chart.artists} /></p>
    </div>
    <DifficultyBadge {difficulty} level={chart.rating} size="sm" />
  </div>

  {#if !loading && entries.length === 0}
    <p class="text-muted-foreground/70 rounded-lg border border-dashed py-4 text-center text-xs">
      No scores yet
    </p>
  {:else}
    <ol class="divide-border/50 divide-y">
      {#each entries as e, i (e.id)}
        <li class="flex items-center gap-2.5 py-1.5 text-sm">
          <span class={cn("w-4 text-center text-xs font-bold tabular-nums", medal[i])}>{i + 1}</span>
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
