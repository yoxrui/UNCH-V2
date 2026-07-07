<script lang="ts">
  import * as Select from "$lib/components/ui/select/index.js";
  import { cn } from "$lib/utils.js";
  import {
    searchTypes,
    sortByOptions,
    orderOptions,
    type Filters,
  } from "$lib/data/index.js";
  import { RiStarFill, RiEqualizerLine } from "$lib/icons.js";

  let { filters = $bindable() }: { filters: Filters } = $props();

  const typeLabel = $derived(searchTypes.find((o) => o.value === filters.searchType)?.label ?? "Quick");
  const sortLabel = $derived(sortByOptions.find((o) => o.value === filters.sortBy)?.label ?? "Decaying Likes");
  const orderLabel = $derived(orderOptions.find((o) => o.value === filters.sortOrder)?.label ?? "Descending");

  const showSort = $derived(filters.searchType !== "random" && filters.searchType !== "newest");
  const isAdvanced = $derived(filters.searchType === "advanced");

  const inputClass =
    "bg-card focus-visible:ring-ring/50 h-10 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2";
</script>

<div
  class="bg-card/60 supports-backdrop-filter:bg-card/40 space-y-3 rounded-2xl border p-3 backdrop-blur-xl sm:p-4"
>
  <div class="flex flex-wrap items-center gap-2.5">
    <RiEqualizerLine class="text-muted-foreground size-4" />

    <Select.Root type="single" bind:value={filters.searchType}>
      <Select.Trigger class="h-10 rounded-xl sm:w-40" aria-label="Search type">
        <span class="text-muted-foreground mr-1 text-xs">Type</span>{typeLabel}
      </Select.Trigger>
      <Select.Content>
        {#each searchTypes as o (o.value)}
          <Select.Item value={o.value} label={o.label}>{o.label}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>

    {#if showSort}
      <Select.Root type="single" bind:value={filters.sortBy}>
        <Select.Trigger class="h-10 rounded-xl sm:w-48" aria-label="Sort by">
          <span class="text-muted-foreground mr-1 text-xs">Sort</span>{sortLabel}
        </Select.Trigger>
        <Select.Content>
          {#each sortByOptions as o (o.value)}
            <Select.Item value={o.value} label={o.label}>{o.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>

      <Select.Root type="single" bind:value={filters.sortOrder}>
        <Select.Trigger class="h-10 rounded-xl sm:w-40" aria-label="Order">
          <span class="text-muted-foreground mr-1 text-xs">Order</span>{orderLabel}
        </Select.Trigger>
        <Select.Content>
          {#each orderOptions as o (o.value)}
            <Select.Item value={o.value} label={o.label}>{o.label}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>

      <button
        type="button"
        onclick={() => (filters.staffPick = !filters.staffPick)}
        aria-pressed={filters.staffPick}
        class={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
          filters.staffPick
            ? "border-amber-400/40 bg-amber-400/15 text-amber-600 dark:text-amber-300"
            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
        )}
      >
        <RiStarFill class="size-3" /> Staff picks
      </button>
    {/if}
  </div>

  {#if isAdvanced}
    <div class="grid gap-2.5 border-t pt-3 sm:grid-cols-2 lg:grid-cols-3">
      <label class="space-y-1">
        <span class="text-muted-foreground text-xs">Min rating</span>
        <input type="number" min="1" max="99" placeholder="e.g. 25" bind:value={filters.minRating} class={inputClass} />
      </label>
      <label class="space-y-1">
        <span class="text-muted-foreground text-xs">Max rating</span>
        <input type="number" min="1" max="99" placeholder="e.g. 32" bind:value={filters.maxRating} class={inputClass} />
      </label>
      <label class="space-y-1">
        <span class="text-muted-foreground text-xs">Author handle</span>
        <input type="text" placeholder="e.g. 78302" bind:value={filters.authorHandle} class={inputClass} />
      </label>
      <label class="space-y-1">
        <span class="text-muted-foreground text-xs">Title includes</span>
        <input type="text" placeholder="Search in titles…" bind:value={filters.titleIncludes} class={inputClass} />
      </label>
      <label class="space-y-1">
        <span class="text-muted-foreground text-xs">Artists includes</span>
        <input type="text" placeholder="Search in artists…" bind:value={filters.artistsIncludes} class={inputClass} />
      </label>
      <label class="space-y-1">
        <span class="text-muted-foreground text-xs">Description includes</span>
        <input type="text" placeholder="Search in descriptions…" bind:value={filters.descriptionIncludes} class={inputClass} />
      </label>
      <label class="space-y-1 sm:col-span-2 lg:col-span-3">
        <span class="text-muted-foreground text-xs">Tags</span>
        <input type="text" placeholder="Comma-separated tags" bind:value={filters.tags} class={inputClass} />
      </label>
    </div>
  {/if}
</div>
