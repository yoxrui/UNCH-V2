<script lang="ts">
  import type { Chart } from "$lib/data/index.js";
  import ChartCard from "./chart-card.svelte";
  import * as Carousel from "$lib/components/carousel/index.js";
  import { cn } from "$lib/utils.js";
  import { RiArrowRightLine } from "$lib/icons.js";

  let {
    title,
    charts,
    href,
    hrefLabel = "View all",
    columns = "row",
    carousel = false,
  }: {
    title?: string;
    charts: Chart[];
    href?: string;
    hrefLabel?: string;
    columns?: "row" | "grid";
    /** Render as a draggable, snapping Embla row instead of a static grid. */
    carousel?: boolean;
  } = $props();
</script>

<section class="space-y-5">
  {#if title}
    <div class="flex items-end justify-between gap-3">
      <h2 class="font-heading text-lg font-semibold tracking-tight">{title}</h2>
      {#if href}
        <a
          {href}
          class="text-muted-foreground hover:text-foreground group inline-flex items-center gap-1 text-sm transition-colors"
        >
          {hrefLabel}
          <RiArrowRightLine
            class="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          />
        </a>
      {/if}
    </div>
  {/if}

  {#if carousel}
    <Carousel.Root opts={{ align: "start", dragFree: true, containScroll: "trimSnaps" }}>
      <Carousel.Content class="gap-5">
        {#each charts as chart (chart.id)}
          <Carousel.Item class="basis-[78%] sm:basis-[calc((100%-1.25rem)/2)] lg:basis-[calc((100%-3.75rem)/4)]">
            <ChartCard {chart} />
          </Carousel.Item>
        {/each}
      </Carousel.Content>
    </Carousel.Root>
  {:else}
    <div
      class={cn(
        "grid gap-4 sm:gap-5",
        columns === "row"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
      )}
    >
      {#each charts as chart (chart.id)}
        <ChartCard {chart} />
      {/each}
    </div>
  {/if}
</section>
