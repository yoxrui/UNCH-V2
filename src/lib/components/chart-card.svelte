<script lang="ts">
  import type { Chart } from "$lib/data/index.js";
  import { difficultyFromTags, compact, coverUrl, backgroundUrl, bgmProxyUrl } from "$lib/data/index.js";
  import CoverArt from "./cover-art.svelte";
  import DifficultyBadge from "./difficulty-badge.svelte";
  import Waveform from "./waveform.svelte";
  import FormattedText from "./formatted-text.svelte";
  import { Spring } from "svelte/motion";
  import { fly } from "svelte/transition";
  import { cubicOut } from "svelte/easing";
  import { RiHeart3Fill, RiChat3Line, RiStarFill } from "$lib/icons.js";

  let { chart }: { chart: Chart } = $props();
  const difficulty = $derived(difficultyFromTags(chart.tags, chart.rating));

  let hovered = $state(false);
  let everHovered = $state(false);
  let reduced = false;

  const lift = new Spring(0, { stiffness: 0.2, damping: 0.7 });
  const heart = new Spring(1, { stiffness: 0.18, damping: 0.45 });

  function enter() {
    hovered = true;
    everHovered = true;
    if (reduced) return;
    lift.target = -5;
    heart.target = 1.28;
  }
  function leave() {
    hovered = false;
    lift.target = 0;
    heart.target = 1;
  }

  $effect(() => {
    reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  });
</script>

<article
  onmouseenter={enter}
  onmouseleave={leave}
  onfocusin={enter}
  onfocusout={leave}
  style="transform: translateY({lift.current}px)"
  class="group bg-card relative flex flex-col overflow-hidden rounded-2xl ring-1 ring-border/70 transition-[box-shadow,outline] duration-200 hover:shadow-lg hover:shadow-primary/5 hover:ring-primary/40"
>
  <!-- banner + floating square cover -->
  <div class="relative">
    <div class="aspect-16/7 w-full overflow-hidden">
      <CoverArt
        id={`${chart.id}-bg`}
        src={backgroundUrl(chart)}
        rounded="rounded-none"
        class="size-full transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
      />
      <div class="from-card absolute inset-0 bg-linear-to-t to-transparent"></div>
    </div>

    <CoverArt
      id={chart.id}
      title={chart.title}
      src={coverUrl(chart)}
      class="ring-card absolute bottom-0 left-4 size-16 translate-y-1/2 ring-4"
    />

    <div class="absolute top-3 right-3">
      <DifficultyBadge {difficulty} level={chart.rating} />
    </div>

    {#if chart.staff_pick}
      <span
        class="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-100 backdrop-blur"
      >
        <RiStarFill class="size-2.5" /> STAFF
      </span>
    {/if}

    {#if everHovered && hovered}
      <div
        transition:fly={{ y: 10, duration: 200, easing: cubicOut }}
        class="bg-background/70 absolute right-2 bottom-2 left-24 z-10 rounded-lg px-2 py-1 shadow-sm backdrop-blur"
      >
        <Waveform id={chart.id} src={bgmProxyUrl(chart)} variant="compact" height={28} />
      </div>
    {/if}
  </div>

  <!-- body -->
  <div class="flex flex-1 flex-col gap-3 px-4 pt-9 pb-4">
    <div class="min-w-0 space-y-1">
      <h3 class="truncate text-base font-semibold tracking-tight">
        <a
          href={`/levels/UnCh-${chart.id}`}
          class="hover:text-primary transition-colors after:absolute after:inset-0 after:content-['']"
          ><FormattedText text={chart.title} /></a
        >
      </h3>
      <p class="text-muted-foreground truncate text-sm"><FormattedText text={chart.artists} /></p>
    </div>

    <div class="text-muted-foreground mt-auto flex items-center justify-between gap-2 text-xs">
      <a
        href={`/creators/${chart.author_handle}`}
        class="relative z-10 inline-flex min-w-0 items-center gap-1 truncate font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
        >{chart.chart_design}</a
      >
      <div class="flex shrink-0 items-center gap-3 tabular-nums">
        <span class="inline-flex items-center gap-1">
          <span
            class="inline-flex origin-center"
            style="transform: scale({heart.current})"
          >
            <RiHeart3Fill class="size-3.5 text-rose-400" />
          </span>{compact(chart.like_count)}
        </span>
        <span class="inline-flex items-center gap-1">
          <RiChat3Line class="size-3.5" />{compact(chart.comment_count)}
        </span>
      </div>
    </div>
  </div>
</article>
