<script lang="ts">
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import { cn } from "$lib/utils.js";
  import {
    searchTypes,
    sortByOptions,
    orderOptions,
    activeFilterCount,
    type Filters,
  } from "$lib/data/index.js";
  import {
    RiSearchLine,
    RiCloseLine,
    RiEqualizerLine,
    RiArrowUpDownLine,
    RiCheckLine,
    RiStarFill,
  } from "$lib/icons.js";

  let {
    filters = $bindable(),
    total,
    autofocus = false,
  }: { filters: Filters; total: number; autofocus?: boolean } = $props();

  let filtersOpen = $state(false);
  let sortOpen = $state(false);
  let input = $state<HTMLInputElement | null>(null);

  const activeCount = $derived(activeFilterCount(filters));
  const sortLabel = $derived(sortByOptions.find((o) => o.value === filters.sortBy)?.label ?? "Decaying Likes");
  const showSort = $derived(filters.searchType !== "random" && filters.searchType !== "newest");
  const isAdvanced = $derived(filters.searchType === "advanced");

  const inputClass =
    "bg-card focus-visible:ring-ring/50 h-11 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2";

  function resetFilters() {
    filters.staffPick = false;
    filters.minRating = "";
    filters.maxRating = "";
    filters.titleIncludes = "";
    filters.descriptionIncludes = "";
    filters.artistsIncludes = "";
    filters.tags = "";
    filters.authorHandle = "";
  }

  $effect(() => {
    if (autofocus && input) input.focus();
  });
</script>

<div
  class="bg-background/85 supports-backdrop-filter:bg-background/70 sticky top-[4.5rem] z-30 -mx-4 space-y-2.5 px-4 py-2.5 backdrop-blur-xl sm:-mx-6 sm:px-6"
>
  <!-- Search -->
  <div class="relative">
    <RiSearchLine
      class="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2"
    />
    <input
      bind:this={input}
      bind:value={filters.keywords}
      type="search"
      inputmode="search"
      enterkeyhint="search"
      placeholder="Search charts, songs, charters…"
      aria-label="Search charts"
      class="bg-card focus-visible:ring-ring/50 h-12 w-full rounded-2xl border pr-11 pl-11 text-[15px] shadow-sm outline-none focus-visible:ring-2"
    />
    {#if filters.keywords}
      <button
        type="button"
        onclick={() => (filters.keywords = "")}
        aria-label="Clear search"
        class="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 grid size-8 -translate-y-1/2 place-items-center rounded-full"
      >
        <RiCloseLine class="size-5" />
      </button>
    {/if}
  </div>

  <!-- Quick controls: sort + filters -->
  <div class="flex items-center gap-2">
    <button
      type="button"
      onclick={() => (sortOpen = true)}
      class="bg-card inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-medium"
    >
      <RiArrowUpDownLine class="text-muted-foreground size-4" />
      <span class="truncate">{sortLabel}</span>
    </button>
    <button
      type="button"
      onclick={() => (filtersOpen = true)}
      class={cn(
        "inline-flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 text-sm font-medium",
        activeCount > 0 ? "border-primary/40 bg-primary/10 text-primary" : "bg-card",
      )}
    >
      <RiEqualizerLine class="size-4" />
      Filters
      {#if activeCount > 0}
        <span
          class="bg-primary text-primary-foreground grid size-5 place-items-center rounded-full text-[11px] font-bold tabular-nums"
          >{activeCount}</span
        >
      {/if}
    </button>
  </div>
</div>

<!-- Sort + type bottom sheet -->
<Drawer.Root bind:open={sortOpen}>
  <Drawer.Content class="pb-[env(safe-area-inset-bottom)]">
    <Drawer.Header class="text-left">
      <Drawer.Title>Sort & type</Drawer.Title>
    </Drawer.Header>
    <div class="max-h-[65vh] space-y-5 overflow-y-auto px-4 pb-6">
      <section class="space-y-2">
        <h3 class="text-muted-foreground text-xs font-semibold">Search type</h3>
        <div class="flex flex-wrap gap-2">
          {#each searchTypes as o (o.value)}
            {@const active = filters.searchType === o.value}
            <button
              type="button"
              onclick={() => (filters.searchType = o.value)}
              aria-pressed={active}
              class={cn(
                "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                active ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground",
              )}
            >
              {o.label}
            </button>
          {/each}
        </div>
      </section>

      {#if showSort}
        <section class="space-y-1">
          <h3 class="text-muted-foreground text-xs font-semibold">Sort by</h3>
          {#each sortByOptions as o (o.value)}
            {@const active = filters.sortBy === o.value}
            <button
              type="button"
              onclick={() => (filters.sortBy = o.value)}
              class={cn(
                "flex h-11 w-full items-center justify-between rounded-xl px-4 text-[15px] transition-colors",
                active ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted",
              )}
            >
              {o.label}
              {#if active}<RiCheckLine class="size-5" />{/if}
            </button>
          {/each}
        </section>

        <section class="space-y-2">
          <h3 class="text-muted-foreground text-xs font-semibold">Order</h3>
          <div class="flex gap-2">
            {#each orderOptions as o (o.value)}
              {@const active = filters.sortOrder === o.value}
              <button
                type="button"
                onclick={() => (filters.sortOrder = o.value)}
                aria-pressed={active}
                class={cn(
                  "flex-1 rounded-xl border px-3.5 py-2 text-sm font-medium transition-colors",
                  active ? "border-primary/50 bg-primary/10 text-primary" : "border-border text-muted-foreground",
                )}
              >
                {o.label}
              </button>
            {/each}
          </div>
        </section>
      {/if}
    </div>
  </Drawer.Content>
</Drawer.Root>

<!-- Filters bottom sheet -->
<Drawer.Root bind:open={filtersOpen}>
  <Drawer.Content class="pb-[env(safe-area-inset-bottom)]">
    <Drawer.Header class="flex-row items-center justify-between text-left">
      <Drawer.Title>Filters</Drawer.Title>
      {#if activeCount > 0}
        <button type="button" onclick={resetFilters} class="text-primary text-sm font-medium">Reset</button>
      {/if}
    </Drawer.Header>

    <div class="max-h-[65vh] space-y-4 overflow-y-auto px-4 pt-1 pb-4">
      {#if filters.searchType !== "random"}
        <button
          type="button"
          onclick={() => (filters.staffPick = !filters.staffPick)}
          aria-pressed={filters.staffPick}
          class={cn(
            "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
            filters.staffPick
              ? "border-amber-400/40 bg-amber-400/15 text-amber-600 dark:text-amber-300"
              : "border-border text-muted-foreground",
          )}
        >
          <RiStarFill class="size-4" /> Staff picks only
        </button>
      {/if}

      {#if isAdvanced}
        <div class="grid grid-cols-2 gap-3">
          <label class="space-y-1">
            <span class="text-muted-foreground text-xs">Min rating</span>
            <input type="number" min="1" max="99" placeholder="25" bind:value={filters.minRating} class={inputClass} />
          </label>
          <label class="space-y-1">
            <span class="text-muted-foreground text-xs">Max rating</span>
            <input type="number" min="1" max="99" placeholder="32" bind:value={filters.maxRating} class={inputClass} />
          </label>
        </div>
        <label class="block space-y-1">
          <span class="text-muted-foreground text-xs">Author handle</span>
          <input type="text" placeholder="e.g. 78302" bind:value={filters.authorHandle} class={inputClass} />
        </label>
        <label class="block space-y-1">
          <span class="text-muted-foreground text-xs">Title includes</span>
          <input type="text" placeholder="Search in titles…" bind:value={filters.titleIncludes} class={inputClass} />
        </label>
        <label class="block space-y-1">
          <span class="text-muted-foreground text-xs">Artists includes</span>
          <input type="text" placeholder="Search in artists…" bind:value={filters.artistsIncludes} class={inputClass} />
        </label>
        <label class="block space-y-1">
          <span class="text-muted-foreground text-xs">Description includes</span>
          <input type="text" placeholder="Search in descriptions…" bind:value={filters.descriptionIncludes} class={inputClass} />
        </label>
        <label class="block space-y-1">
          <span class="text-muted-foreground text-xs">Tags</span>
          <input type="text" placeholder="Comma-separated tags" bind:value={filters.tags} class={inputClass} />
        </label>
      {/if}
    </div>

    <Drawer.Footer class="pt-2">
      <button
        type="button"
        onclick={() => (filtersOpen = false)}
        class="bg-primary text-primary-foreground flex h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold"
      >
        Show {total}
        {total === 1 ? "chart" : "charts"}
      </button>
    </Drawer.Footer>
  </Drawer.Content>
</Drawer.Root>
