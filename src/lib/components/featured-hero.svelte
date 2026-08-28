<script lang="ts">
  import type { Chart } from "$lib/data/index.js";
  import { difficultyFromTags, compact, coverUrl, backgroundUrl } from "$lib/data/index.js";
  import CoverArt from "./cover-art.svelte";
  import DifficultyBadge from "./difficulty-badge.svelte";
  import FormattedText from "./formatted-text.svelte";
  import Button from "$lib/components/button.svelte";
  import * as Carousel from "$lib/components/carousel/index.js";
  import type { CarouselApi } from "$lib/components/carousel/index.js";
  import { Spring } from "svelte/motion";
  import { cn } from "$lib/utils.js";
  import {
    RiArrowRightLine,
    RiHeart3Fill,
    RiChat3Line,
    RiStarFill,
    RiArrowLeftSLine,
    RiArrowRightSLine,
  } from "$lib/icons.js";

  let { charts }: { charts: Chart[] } = $props();

  let api = $state<CarouselApi>();
  let selected = $state(0);
  let paused = $state(false);

  const heroBg = $derived(charts[selected] ? backgroundUrl(charts[selected]) : null);

  // Sliding active-dot indicator (osu-like). Spring drives the horizontal pos.
  const DOT_STEP = 14; // dot (6px) + gap (8px)
  const dot = new Spring(0, { stiffness: 0.16, damping: 0.82 });
  $effect(() => {
    dot.target = selected;
  });

  $effect(() => {
    if (!api) return;
    const onSelect = () => (selected = api!.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => api?.off("select", onSelect);
  });

  // Autoplay, paused on hover/focus and when the user prefers reduced motion.
  $effect(() => {
    if (!api || charts.length <= 1) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      if (!paused) api!.scrollNext();
    }, 6000);
    return () => clearInterval(timer);
  });
</script>

<section
  class="flex flex-col items-center gap-4"
  onmouseenter={() => (paused = true)}
  onmouseleave={() => (paused = false)}
  onfocusin={() => (paused = true)}
  onfocusout={() => (paused = false)}
  role="group"
  aria-roledescription="carousel"
  aria-label="Featured staff picks"
>
  <div class="bg-featured text-featured-foreground relative w-full max-w-5xl overflow-hidden rounded-3xl">
    <div class="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {#if heroBg}
        <img src={heroBg} alt="" class="size-full scale-110 object-cover opacity-25 blur-2xl" />
      {/if}
      <div class="from-featured/80 via-featured/60 to-featured/90 absolute inset-0 bg-linear-to-t"></div>
    </div>
    <Carousel.Root setApi={(a) => (api = a)} opts={{ loop: true }} class="w-full">
      <Carousel.Content class="ms-0">
        {#each charts as current (current.id)}
          {@const difficulty = difficultyFromTags(current.tags, current.rating)}
          <Carousel.Item class="ps-0">
            <div class="flex flex-col gap-6 p-4 sm:flex-row sm:items-stretch sm:gap-8 sm:p-6">
              <!-- Artwork -->
              <a
                href={`/levels/UnCh-${current.id}`}
                class="ring-background/10 group relative aspect-video w-full shrink-0 overflow-hidden rounded-2xl ring-1 sm:aspect-square sm:size-60 md:size-64"
                aria-label={`Open ${current.title}`}
              >
                <CoverArt
                  id={current.id}
                  title={current.title}
                  src={coverUrl(current)}
                  rounded="rounded-2xl"
                  class="size-full transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
                />
              </a>

              <!-- Details -->
              <div class="flex min-w-0 flex-1 flex-col gap-3.5">
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-amber-700 dark:text-amber-300"
                  >
                    <RiStarFill class="size-3" /> STAFF PICK
                  </span>
                  <DifficultyBadge {difficulty} level={current.rating} />
                </div>

                <div class="min-w-0 space-y-1.5">
                  <h2 class="font-heading truncate text-2xl font-bold tracking-tight sm:text-3xl">
                    <FormattedText text={current.title} />
                  </h2>
                  <p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
                    <span class="text-featured-foreground/70 truncate"><FormattedText text={current.artists} /></span>
                    <span class="bg-featured-foreground/30 size-1 rounded-full"></span>
                    <span class="text-featured-foreground/70">
                      by
                      <a
                        href={`/creators/${current.author_handle}`}
                        class="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
                        >{current.chart_design}</a
                      >
                    </span>
                  </p>
                </div>

                <div class="hidden sm:block sm:h-11">
                  {#if current.description}
                    <p class="text-featured-foreground/70 line-clamp-2 max-w-2xl text-sm leading-snug">
                      <FormattedText text={current.description} />
                    </p>
                  {/if}
                </div>

                {#if current.tags.length}
                  <div class="hidden flex-wrap gap-1.5 sm:flex">
                    {#each current.tags.slice(0, 4) as tag (tag)}
                      <span class="bg-background/40 text-featured-foreground/70 rounded px-1.5 py-0.5 text-[11px]"
                        >#{tag}</span
                      >
                    {/each}
                  </div>
                {/if}

                <div class="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
                  <Button href={`/levels/UnCh-${current.id}`} class="rounded-full">
                    View details
                    <RiArrowRightLine class="size-4" />
                  </Button>
                  <div class="text-featured-foreground/70 flex items-center gap-4 text-sm tabular-nums">
                    <span class="inline-flex items-center gap-1.5">
                      <RiHeart3Fill class="size-4 text-rose-400" />{compact(current.like_count)}
                    </span>
                    <span class="inline-flex items-center gap-1.5">
                      <RiChat3Line class="size-4" />{compact(current.comment_count)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Carousel.Item>
        {/each}
      </Carousel.Content>
    </Carousel.Root>

    <!-- Prev / next -->
    {#if charts.length > 1}
      <button
        type="button"
        onclick={() => api?.scrollPrev()}
        aria-label="Previous featured chart"
        class="bg-background/60 hover:bg-background absolute top-1/2 left-2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm backdrop-blur transition-colors sm:flex"
      >
        <RiArrowLeftSLine class="size-5" />
      </button>
      <button
        type="button"
        onclick={() => api?.scrollNext()}
        aria-label="Next featured chart"
        class="bg-background/60 hover:bg-background absolute top-1/2 right-2 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border shadow-sm backdrop-blur transition-colors sm:flex"
      >
        <RiArrowRightSLine class="size-5" />
      </button>
    {/if}
  </div>

  <!-- Dots: muted track + a single spring-driven primary dot that slides -->
  {#if charts.length > 1}
    <div class="relative flex items-center gap-2">
      {#each charts as chart, i (chart.id)}
        <button
          type="button"
          onclick={() => api?.scrollTo(i)}
          aria-label={`Go to featured chart ${i + 1}`}
          aria-current={i === selected}
          class="bg-muted-foreground/30 hover:bg-muted-foreground/60 size-1.5 rounded-full transition-colors"
        ></button>
      {/each}
      <span
        class="bg-primary pointer-events-none absolute top-1/2 size-1.5 -translate-y-1/2 rounded-full"
        style="left: {dot.current * DOT_STEP}px"
      ></span>
    </div>
  {/if}
</section>
