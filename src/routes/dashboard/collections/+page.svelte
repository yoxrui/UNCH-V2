<script lang="ts">
  import CollectionGrid from "$lib/components/collection-grid.svelte";
  import Button from "$lib/components/button.svelte";
  import { listCollections } from "$lib/data/index.js";
  import { RiArrowLeftLine, RiAddLine } from "$lib/icons.js";

  const collections = listCollections();
</script>

<svelte:head>
  <title>Collections | UntitledCharts</title>
</svelte:head>

<main class="mx-auto max-w-5xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
  <a
    href="/dashboard"
    class="text-muted-foreground hover:text-foreground group inline-flex items-center gap-1.5 text-sm transition-colors"
  >
    <RiArrowLeftLine
      class="size-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none"
    />
    Dashboard
  </a>

  <div class="flex items-end justify-between gap-3">
    <div class="space-y-1">
      <h1 class="font-heading text-2xl font-bold tracking-tight">Playlists &amp; Collections</h1>
      <p class="text-muted-foreground text-sm">{collections.length} folders in your library.</p>
    </div>
    <Button variant="outline" size="sm" class="shrink-0 rounded-full">
      <RiAddLine class="size-4" />
      New collection
    </Button>
  </div>

  <div
    class="bg-muted/30 text-muted-foreground rounded-xl border border-dashed px-4 py-3 text-sm"
  >
    Preview only, collections aren't saved to the backend yet.
  </div>

  <CollectionGrid {collections} />
</main>
