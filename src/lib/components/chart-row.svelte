<script lang="ts">
  import type { Chart } from "$lib/data/index.js";
  import { difficultyFromTags, difficultyMeta, compact, relativeTime } from "$lib/data/index.js";
  import CoverArt from "./cover-art.svelte";
  import DifficultyBadge from "./difficulty-badge.svelte";
  import { RiHeart3Fill, RiChat3Line, RiStarFill, RiTimeLine } from "remixicon-svelte";

  let { chart }: { chart: Chart } = $props();
  const difficulty = $derived(difficultyFromTags(chart.tags, chart.rating));
  const ring = $derived(difficultyMeta[difficulty].ring);
</script>

<article
  class="group bg-card/70 hover:bg-card ring-border/60 hover:ring-border relative flex items-center gap-4 rounded-xl p-3 ring-1 transition-colors"
>
  <CoverArt id={chart.id} title={chart.title} {ring} class="size-16 shrink-0 rounded-lg" />

  <div class="flex min-w-0 flex-1 flex-col gap-1.5">
    <div class="flex items-start gap-2">
      <h3 class="min-w-0 flex-1 truncate text-base font-semibold tracking-tight">
        <a
          href={`/levels/${chart.id}`}
          class="hover:text-primary transition-colors after:absolute after:inset-0 after:content-['']"
          >{chart.title}</a
        >
      </h3>
      {#if chart.staff_pick}
        <span
          class="inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-300"
        >
          <RiStarFill class="size-2.5" /> STAFF
        </span>
      {/if}
    </div>

    <p class="text-muted-foreground truncate text-xs">
      by
      <a
        href={`/creators/${chart.author}`}
        class="relative z-10 font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
        >{chart.chart_design}</a
      >
      · <span class="text-foreground/80 font-medium">{chart.artists}</span>
    </p>

    <div class="flex flex-wrap items-center gap-x-2 gap-y-1.5 pt-0.5">
      <DifficultyBadge {difficulty} level={chart.rating} size="sm" />
      {#each chart.tags.slice(0, 3) as tag (tag)}
        <span class="bg-muted/60 text-muted-foreground rounded px-1.5 py-0.5 text-[10px]">#{tag}</span
        >
      {/each}
    </div>
  </div>

  <div class="flex shrink-0 flex-col items-end justify-between gap-2 self-stretch pl-1">
    <div class="text-muted-foreground flex items-center gap-3 text-xs tabular-nums">
      <span class="inline-flex items-center gap-1">
        <RiHeart3Fill class="size-3.5 text-rose-400" />{compact(chart.like_count)}
      </span>
      <span class="inline-flex items-center gap-1">
        <RiChat3Line class="size-3.5" />{compact(chart.comment_count)}
      </span>
    </div>
    <span
      class="text-muted-foreground/80 inline-flex items-center gap-1 text-[11px] whitespace-nowrap"
    >
      <RiTimeLine class="size-3" />
      {relativeTime(chart.updated_at)}
    </span>
  </div>
</article>
