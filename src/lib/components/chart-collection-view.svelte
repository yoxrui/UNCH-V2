<script lang="ts">
  import type { Chart } from "$lib/data/index.js";
  import ChartCard from "./chart-card.svelte";
  import ChartRow from "./chart-row.svelte";
  import ChartListCard from "./chart-list-card.svelte";
  import Select from "./select.svelte";
  import { cn } from "$lib/utils.js";
  import { RiListUnordered, RiGridFill, RiEmotionSadLine } from "$lib/icons.js";

  let {
    charts,
    emptyMessage = "No charts here yet.",
  }: {
    charts: Chart[];
    emptyMessage?: string;
  } = $props();

  type SortKey = "recent" | "rating" | "likes" | "title";
  const sortOptions = [
    { value: "recent", label: "Recently added" },
    { value: "rating", label: "Difficulty" },
    { value: "likes", label: "Most liked" },
    { value: "title", label: "Title (A–Z)" },
  ] as const;

  let sort = $state<SortKey>("recent");
  let view = $state<"grid" | "list">("grid");

  const sorted = $derived.by(() => {
    const cs = [...charts];
    switch (sort) {
      case "rating":
        return cs.sort((a, b) => b.rating - a.rating);
      case "likes":
        return cs.sort((a, b) => b.like_count - a.like_count);
      case "title":
        return cs.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return cs;
    }
  });
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between gap-3">
    <Select bind:value={sort} options={sortOptions} label="Sort" ariaLabel="Sort charts" />

    <!-- view toggle: desktop only (mobile is always the compact list) -->
    <div class="bg-muted/50 hidden items-center rounded-lg border p-0.5 md:flex">
      <button
        type="button"
        onclick={() => (view = "grid")}
        aria-pressed={view === "grid"}
        aria-label="Grid view"
        class={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
          view === "grid"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <RiGridFill class="size-3.5" /> Grid
      </button>
      <button
        type="button"
        onclick={() => (view = "list")}
        aria-pressed={view === "list"}
        aria-label="List view"
        class={cn(
          "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
          view === "list"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <RiListUnordered class="size-3.5" /> List
      </button>
    </div>
  </div>

  {#if charts.length === 0}
    <div
      class="text-muted-foreground flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center"
    >
      <RiEmotionSadLine class="size-10 opacity-50" />
      <p class="text-sm">{emptyMessage}</p>
    </div>
  {:else}
    <!-- Mobile: compact vertical list -->
    <div class="space-y-2.5 md:hidden">
      {#each sorted as chart (chart.id)}
        <ChartListCard {chart} />
      {/each}
    </div>

    <!-- Desktop: grid or list -->
    {#if view === "list"}
      <div class="hidden space-y-2.5 md:block">
        {#each sorted as chart (chart.id)}
          <ChartRow {chart} />
        {/each}
      </div>
    {:else}
      <div class="hidden gap-5 md:grid md:grid-cols-2 lg:grid-cols-3">
        {#each sorted as chart (chart.id)}
          <ChartCard {chart} />
        {/each}
      </div>
    {/if}
  {/if}
</div>
