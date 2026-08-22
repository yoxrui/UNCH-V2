<script lang="ts">
  import type { Chart } from "$lib/data/index.js";
  import { difficultyFromTags, compact, coverUrl, backgroundUrl } from "$lib/data/index.js";
  import CoverArt from "./cover-art.svelte";
  import DifficultyBadge from "./difficulty-badge.svelte";
  import FormattedText from "./formatted-text.svelte";
  import Button from "./button.svelte";
  import Sheet from "./sheet.svelte";
  import { Spring } from "svelte/motion";
  import { RiHeart3Fill, RiChat3Line, RiStarFill, RiEditLine, RiExternalLinkLine } from "$lib/icons.js";

  let { chart }: { chart: Chart } = $props();

  const difficulty = $derived(difficultyFromTags(chart.tags, chart.rating));
  const editHref = $derived(`/dashboard/edit/UnCh-${chart.id}`);
  const viewHref = $derived(`/levels/UnCh-${chart.id}`);

  let drawerOpen = $state(false);
  let reduced = false;
  const lift = new Spring(0, { stiffness: 0.2, damping: 0.7 });

  function enter() {
    if (!reduced) lift.target = -5;
  }
  function leave() {
    lift.target = 0;
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
  class="group bg-card ring-border/70 hover:ring-primary/40 relative flex h-full flex-col overflow-hidden rounded-2xl ring-1 transition-[box-shadow,outline] duration-200 hover:shadow-lg hover:shadow-primary/5"
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
      class="ring-card absolute bottom-0 left-4 z-20 size-16 translate-y-1/2 ring-4"
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

    <span
      class="bg-background/70 absolute top-3 left-3 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide backdrop-blur"
      class:hidden={chart.staff_pick}
    >
      {chart.status}
    </span>

    <!-- Desktop: hover actions in the same spot as the card music player -->
    <div
      class="pointer-events-none absolute right-2 bottom-2 left-24 z-10 hidden items-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:flex"
    >
      <Button href={editHref} size="sm" class="pointer-events-auto h-8 flex-1 gap-1 rounded-full px-2 text-xs">
        <RiEditLine class="size-3.5" />
        Edit
      </Button>
      <Button
        href={viewHref}
        size="sm"
        variant="secondary"
        class="pointer-events-auto h-8 flex-1 gap-1 rounded-full px-2 text-xs"
      >
        <RiExternalLinkLine class="size-3.5" />
        View
      </Button>
    </div>
  </div>

  <!-- body -->
  <div class="flex flex-1 flex-col gap-3 px-4 pt-9 pb-4">
    <div class="min-w-0 space-y-1">
      <h3 class="truncate text-base font-semibold tracking-tight">
        <FormattedText text={chart.title} />
      </h3>
      <p class="text-muted-foreground truncate text-sm"><FormattedText text={chart.artists} /></p>
    </div>

    <div class="text-muted-foreground mt-auto flex items-center justify-between gap-2 text-xs">
      <span class="min-w-0 truncate font-medium">{chart.chart_design}</span>
      <div class="flex shrink-0 items-center gap-3 tabular-nums">
        <span class="inline-flex items-center gap-1">
          <RiHeart3Fill class="size-3.5 text-rose-400" />{compact(chart.like_count)}
        </span>
        <span class="inline-flex items-center gap-1">
          <RiChat3Line class="size-3.5" />{compact(chart.comment_count)}
        </span>
      </div>
    </div>
  </div>

  <!-- Mobile: whole card opens the actions drawer -->
  <button
    type="button"
    onclick={() => (drawerOpen = true)}
    aria-label={`Actions for ${chart.title}`}
    class="absolute inset-0 z-20 sm:hidden"
  ></button>
</article>

<!-- Mobile actions drawer -->
<Sheet bind:open={drawerOpen}>
  <div class="p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
    <div class="flex flex-col items-center gap-2 px-4 pt-3 pb-4 text-center">
      <CoverArt
        id={chart.id}
        title={chart.title}
        src={coverUrl(chart)}
        rounded="rounded-2xl"
        class="ring-border/70 size-20 ring-1"
      />
      <div class="min-w-0 max-w-full">
        <p class="truncate text-base font-semibold tracking-tight">
          <FormattedText text={chart.title} />
        </p>
        <p class="text-muted-foreground truncate text-sm"><FormattedText text={chart.artists} /></p>
      </div>
    </div>
    <a
      href={editHref}
      class="hover:bg-muted flex items-center gap-3 rounded-xl px-3 py-3.5 text-[15px] font-medium"
    >
      <RiEditLine class="size-5 shrink-0" />
      Edit
    </a>
    <a
      href={viewHref}
      class="hover:bg-muted flex items-center gap-3 rounded-xl px-3 py-3.5 text-[15px] font-medium"
    >
      <RiExternalLinkLine class="size-5 shrink-0" />
      View Page
    </a>
  </div>
</Sheet>
