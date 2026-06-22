<script lang="ts">
  import * as Select from "$lib/components/ui/select/index.js";
  import { cn } from "$lib/utils.js";
  import {
    DIFFICULTIES,
    difficultyMeta,
    sortOptions,
    levelRanges,
    type Filters,
    type Difficulty,
  } from "$lib/data/index.js";
  import { RiStarFill, RiEqualizerLine } from "remixicon-svelte";

  let { filters = $bindable() }: { filters: Filters } = $props();

  const sortLabel = $derived(
    sortOptions.find((o) => o.key === filters.sort)?.label ?? "Trending",
  );
  const rangeLabel = $derived(
    levelRanges.find((r) => r.value === filters.range)?.label ?? "Any level",
  );

  function toggleDifficulty(d: Difficulty) {
    filters.difficulties = filters.difficulties.includes(d)
      ? filters.difficulties.filter((x) => x !== d)
      : [...filters.difficulties, d];
  }
</script>

<div
  class="bg-card/60 supports-backdrop-filter:bg-card/40 space-y-3 rounded-2xl border p-3 backdrop-blur-xl sm:p-4"
>
  <!-- Difficulty chips + staff toggle -->
  <div class="flex flex-wrap items-center gap-1.5">
    <RiEqualizerLine class="text-muted-foreground mr-0.5 size-4" />
    {#each DIFFICULTIES as d (d)}
      {@const active = filters.difficulties.includes(d)}
      {@const meta = difficultyMeta[d]}
      <button
        type="button"
        onclick={() => toggleDifficulty(d)}
        aria-pressed={active}
        class={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
          active
            ? meta.badge
            : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
        )}
      >
        <span class={cn("size-1.5 rounded-full", active ? meta.dot : "bg-muted-foreground/50")}
        ></span>
        {d}
      </button>
    {/each}

    <span class="bg-border mx-1 hidden h-5 w-px sm:block"></span>

    <button
      type="button"
      onclick={() => (filters.staffOnly = !filters.staffOnly)}
      aria-pressed={filters.staffOnly}
      class={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
        filters.staffOnly
          ? "border-amber-400/40 bg-amber-400/15 text-amber-600 dark:text-amber-300"
          : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
      )}
    >
      <RiStarFill class="size-3" /> Staff picks
    </button>
  </div>

  <!-- Level range + sort -->
  <div class="flex flex-col gap-2.5 sm:flex-row">
    <Select.Root type="single" bind:value={filters.range}>
      <Select.Trigger class="h-10 rounded-xl sm:w-44" aria-label="Level range">
        <span class="text-muted-foreground mr-1 text-xs">Level</span>{rangeLabel}
      </Select.Trigger>
      <Select.Content>
        {#each levelRanges as r (r.value)}
          <Select.Item value={r.value} label={r.label}>{r.label}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>

    <Select.Root type="single" bind:value={filters.sort}>
      <Select.Trigger class="h-10 rounded-xl sm:w-56" aria-label="Sort by">
        <span class="text-muted-foreground mr-1 text-xs">Sort</span>{sortLabel}
      </Select.Trigger>
      <Select.Content>
        {#each sortOptions as o (o.key)}
          <Select.Item value={o.key} label={o.label}>{o.label}</Select.Item>
        {/each}
      </Select.Content>
    </Select.Root>
  </div>
</div>
