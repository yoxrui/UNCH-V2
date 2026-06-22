<script lang="ts">
  import * as Drawer from "$lib/components/ui/drawer/index.js";
  import { cn } from "$lib/utils.js";
  import {
    DIFFICULTIES,
    difficultyMeta,
    sortOptions,
    levelRanges,
    defaultFilters,
    activeFilterCount,
    type Filters,
    type Difficulty,
  } from "$lib/data/index.js";
  import {
    RiSearchLine,
    RiCloseLine,
    RiEqualizerLine,
    RiArrowUpDownLine,
    RiCheckLine,
    RiStarFill,
  } from "remixicon-svelte";

  let {
    filters = $bindable(),
    total,
    autofocus = false,
  }: { filters: Filters; total: number; autofocus?: boolean } = $props();

  let filtersOpen = $state(false);
  let sortOpen = $state(false);
  let input = $state<HTMLInputElement | null>(null);

  const activeCount = $derived(activeFilterCount(filters));
  const sortLabel = $derived(sortOptions.find((o) => o.key === filters.sort)?.label ?? "Trending");

  function toggleDifficulty(d: Difficulty) {
    filters.difficulties = filters.difficulties.includes(d)
      ? filters.difficulties.filter((x) => x !== d)
      : [...filters.difficulties, d];
  }

  function resetFilters() {
    filters.difficulties = [];
    filters.range = "any";
    filters.staffOnly = false;
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
      bind:value={filters.q}
      type="search"
      inputmode="search"
      enterkeyhint="search"
      placeholder="Search charts, songs, charters…"
      aria-label="Search charts"
      class="bg-card focus-visible:ring-ring/50 h-12 w-full rounded-2xl border pr-11 pl-11 text-[15px] shadow-sm outline-none focus-visible:ring-2"
    />
    {#if filters.q}
      <button
        type="button"
        onclick={() => (filters.q = "")}
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
        activeCount > 0
          ? "border-primary/40 bg-primary/10 text-primary"
          : "bg-card",
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

  <!-- Quick difficulty chips (horizontally scrollable) -->
  <div class="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-0.5 sm:-mx-6 sm:px-6 [scrollbar-width:none]">
    {#each DIFFICULTIES as d (d)}
      {@const active = filters.difficulties.includes(d)}
      {@const meta = difficultyMeta[d]}
      <button
        type="button"
        onclick={() => toggleDifficulty(d)}
        aria-pressed={active}
        class={cn(
          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
          active ? meta.badge : "border-border text-muted-foreground",
        )}
      >
        <span class={cn("size-1.5 rounded-full", active ? meta.dot : "bg-muted-foreground/50")}></span>
        {d}
      </button>
    {/each}
  </div>
</div>

<!-- Sort bottom sheet -->
<Drawer.Root bind:open={sortOpen}>
  <Drawer.Content class="pb-[env(safe-area-inset-bottom)]">
    <Drawer.Header class="text-left">
      <Drawer.Title>Sort by</Drawer.Title>
    </Drawer.Header>
    <div class="max-h-[60vh] space-y-1 overflow-y-auto px-3 pb-6">
      {#each sortOptions as o (o.key)}
        {@const active = filters.sort === o.key}
        <button
          type="button"
          onclick={() => {
            filters.sort = o.key;
            sortOpen = false;
          }}
          class={cn(
            "flex h-12 w-full items-center justify-between rounded-xl px-4 text-[15px] transition-colors",
            active ? "bg-primary/10 text-primary font-semibold" : "hover:bg-muted",
          )}
        >
          {o.label}
          {#if active}<RiCheckLine class="size-5" />{/if}
        </button>
      {/each}
    </div>
  </Drawer.Content>
</Drawer.Root>

<!-- Filters bottom sheet -->
<Drawer.Root bind:open={filtersOpen}>
  <Drawer.Content class="pb-[env(safe-area-inset-bottom)]">
    <Drawer.Header class="flex-row items-center justify-between text-left">
      <Drawer.Title>Filters</Drawer.Title>
      {#if activeCount > 0}
        <button type="button" onclick={resetFilters} class="text-primary text-sm font-medium">
          Reset
        </button>
      {/if}
    </Drawer.Header>

    <div class="max-h-[65vh] space-y-6 overflow-y-auto px-4 pt-1 pb-4">
      <!-- Difficulty -->
      <section class="space-y-2.5">
        <h3 class="text-sm font-semibold">Difficulty</h3>
        <div class="flex flex-wrap gap-2">
          {#each DIFFICULTIES as d (d)}
            {@const active = filters.difficulties.includes(d)}
            {@const meta = difficultyMeta[d]}
            <button
              type="button"
              onclick={() => toggleDifficulty(d)}
              aria-pressed={active}
              class={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
                active ? meta.badge : "border-border text-muted-foreground",
              )}
            >
              <span class={cn("size-1.5 rounded-full", active ? meta.dot : "bg-muted-foreground/50")}></span>
              {d}
            </button>
          {/each}
        </div>
      </section>

      <!-- Level range -->
      <section class="space-y-2.5">
        <h3 class="text-sm font-semibold">Level</h3>
        <div class="flex flex-wrap gap-2">
          {#each levelRanges as r (r.value)}
            {@const active = filters.range === r.value}
            <button
              type="button"
              onclick={() => (filters.range = r.value)}
              aria-pressed={active}
              class={cn(
                "rounded-full border px-3.5 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-primary/50 bg-primary/10 text-primary"
                  : "border-border text-muted-foreground",
              )}
            >
              {r.label}
            </button>
          {/each}
        </div>
      </section>

      <!-- Staff -->
      <section class="space-y-2.5">
        <h3 class="text-sm font-semibold">Collection</h3>
        <button
          type="button"
          onclick={() => (filters.staffOnly = !filters.staffOnly)}
          aria-pressed={filters.staffOnly}
          class={cn(
            "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
            filters.staffOnly
              ? "border-amber-400/40 bg-amber-400/15 text-amber-600 dark:text-amber-300"
              : "border-border text-muted-foreground",
          )}
        >
          <RiStarFill class="size-4" /> Staff picks only
        </button>
      </section>
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
