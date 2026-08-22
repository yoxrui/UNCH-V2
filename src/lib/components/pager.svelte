<script lang="ts">
  import { RiArrowLeftSLine, RiArrowRightSLine } from "$lib/icons.js";

  let {
    count,
    perPage = 10,
    page = $bindable(1),
  }: { count: number; perPage?: number; page?: number } = $props();

  const total = $derived(Math.max(1, Math.ceil(count / perPage)));

  function go(p: number) {
    page = Math.min(Math.max(1, p), total);
  }

  function onChange(e: Event) {
    const v = parseInt((e.currentTarget as HTMLInputElement).value, 10);
    if (!Number.isNaN(v)) go(v);
  }
</script>

{#if total > 1}
  <nav class="flex items-center justify-center gap-2 pt-2" aria-label="Pagination">
    <button
      type="button"
      class="btn btn-sm btn-circle"
      onclick={() => go(page - 1)}
      disabled={page === 1}
      aria-label="Previous page"
    >
      <RiArrowLeftSLine class="size-4" />
    </button>

    <div class="text-muted-foreground inline-flex items-center gap-1.5 text-sm">
      <span>Page</span>
      <input
        type="number"
        min="1"
        max={total}
        value={page}
        onchange={onChange}
        aria-label="Page number"
        class="bg-card focus-visible:ring-ring/50 h-8 w-14 rounded-lg border text-center text-sm tabular-nums outline-none focus-visible:ring-2"
      />
      <span>of {total}</span>
    </div>

    <button
      type="button"
      class="btn btn-sm btn-circle"
      onclick={() => go(page + 1)}
      disabled={page === total}
      aria-label="Next page"
    >
      <RiArrowRightSLine class="size-4" />
    </button>
  </nav>
{/if}
