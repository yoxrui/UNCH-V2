<script lang="ts">
  import type { Chart } from "$lib/data/index.js";
  import {
    difficultyFromTags,
    difficultyMeta,
    compact,
    parseDescriptionMeta,
  } from "$lib/data/index.js";
  import CoverArt from "./cover-art.svelte";
  import DifficultyBadge from "./difficulty-badge.svelte";
  import Waveform from "./waveform.svelte";
  import { slide } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import {
    RiHeart3Fill,
    RiChat3Line,
    RiStarFill,
    RiPlayFill,
    RiArrowDownSLine,
  } from "remixicon-svelte";

  let { chart }: { chart: Chart } = $props();

  const difficulty = $derived(difficultyFromTags(chart.tags, chart.rating));
  const ring = $derived(difficultyMeta[difficulty].ring);
  const meta = $derived(parseDescriptionMeta(chart.description));
  const hasExtra = $derived(chart.tags.length > 0 || !!(meta.bpm || meta.notes || meta.combo));

  let expanded = $state(false);
  let mounted = $state(false); // lazily mount the (heavy) waveform on first expand

  function toggle(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    expanded = !expanded;
    if (expanded) mounted = true;
  }
</script>

<article
  class="group bg-card ring-border/70 relative rounded-2xl ring-1 transition-colors active:bg-muted/40"
>
  <div class="flex items-stretch gap-3 p-3">
    <!-- Cover + play / preview affordance -->
    <div class="relative shrink-0">
      <CoverArt id={chart.id} title={chart.title} {ring} class="size-18 rounded-xl" />
      <button
        type="button"
        onclick={toggle}
        aria-label={expanded ? "Hide preview" : "Preview audio"}
        aria-expanded={expanded}
        class="absolute inset-0 z-10 grid place-items-center rounded-xl bg-black/30 text-white transition-colors active:bg-black/45"
      >
        <span class="grid size-9 place-items-center rounded-full bg-white/90 text-slate-900 shadow">
          <RiPlayFill class="size-4 translate-x-px" />
        </span>
      </button>
    </div>

    <!-- Core info -->
    <div class="flex min-w-0 flex-1 flex-col gap-1.5">
      <div class="flex min-w-0 items-start gap-2">
        <h3 class="min-w-0 flex-1 text-[15px] leading-snug font-semibold tracking-tight">
          <a
            href={`/levels/${chart.id}`}
            class="hover:text-primary line-clamp-2 transition-colors after:absolute after:inset-0 after:content-['']"
            >{chart.title}</a
          >
        </h3>
        {#if chart.staff_pick}
          <span
            class="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-md border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-300"
          >
            <RiStarFill class="size-2.5" />
          </span>
        {/if}
      </div>

      <div class="flex flex-wrap items-center gap-1.5">
        <DifficultyBadge {difficulty} level={chart.rating} size="sm" />
        <span class="text-muted-foreground min-w-0 truncate text-xs">{chart.artists}</span>
      </div>

      <div class="mt-auto flex items-center justify-between gap-2 pt-0.5">
        <a
          href={`/creators/${chart.author}`}
          class="relative z-10 min-w-0 truncate text-xs font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
          >{chart.chart_design}</a
        >
        <div class="text-muted-foreground flex shrink-0 items-center gap-3 text-xs tabular-nums">
          <span class="inline-flex items-center gap-1">
            <RiHeart3Fill class="size-3.5 text-rose-400" />{compact(chart.like_count)}
          </span>
          <span class="inline-flex items-center gap-1">
            <RiChat3Line class="size-3.5" />{compact(chart.comment_count)}
          </span>
        </div>
      </div>
    </div>

    <!-- Expand secondary details -->
    {#if hasExtra}
      <button
        type="button"
        onclick={toggle}
        aria-label={expanded ? "Show less" : "Show more details"}
        aria-expanded={expanded}
        class="text-muted-foreground hover:text-foreground relative z-10 -mr-1 grid w-7 shrink-0 place-items-center rounded-lg transition-colors"
      >
        <RiArrowDownSLine
          class={["size-5 transition-transform duration-200", expanded && "rotate-180"]}
        />
      </button>
    {/if}
  </div>

  <!-- Expandable: lightweight preview + secondary metadata -->
  {#if expanded}
    <div transition:slide={{ duration: 200, easing: cubicOut }} class="relative z-10 px-3 pb-3">
      <div class="border-border/70 space-y-3 border-t pt-3">
        {#if mounted}
          <Waveform id={chart.id} variant="compact" height={30} />
        {/if}

        {#if meta.bpm || meta.notes || meta.combo}
          <div class="flex flex-wrap gap-1.5">
            {#if meta.bpm}
              <span class="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-[11px]"
                >{meta.bpm} BPM</span
              >
            {/if}
            {#if meta.notes}
              <span
                class="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-[11px] tabular-nums"
                >{compact(meta.notes)} notes</span
              >
            {/if}
            {#if meta.combo}
              <span
                class="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-[11px] tabular-nums"
                >{compact(meta.combo)} combo</span
              >
            {/if}
          </div>
        {/if}

        {#if chart.tags.length}
          <div class="flex flex-wrap gap-1.5">
            {#each chart.tags.slice(0, 5) as tag (tag)}
              <span class="bg-muted/60 text-muted-foreground rounded px-1.5 py-0.5 text-[10px]"
                >#{tag}</span
              >
            {/each}
          </div>
        {/if}
      </div>
    </div>
  {/if}
</article>
