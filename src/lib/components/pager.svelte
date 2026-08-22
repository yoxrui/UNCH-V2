<script lang="ts">
<<<<<<< HEAD
=======
  import { cn } from "$lib/utils.js";
>>>>>>> 44d77f6faedd3aa3bbfc5a9d7327334914351f3e
  import { RiArrowLeftSLine, RiArrowRightSLine } from "$lib/icons.js";

  let {
    count,
    perPage = 10,
    page = $bindable(1),
  }: { count: number; perPage?: number; page?: number } = $props();

  const total = $derived(Math.max(1, Math.ceil(count / perPage)));

<<<<<<< HEAD
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
=======
  const range = (start: number, end: number) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i);

  // Page buttons with ellipses, keeping the current page flanked by one sibling.
  const items = $derived.by<(number | "ellipsis")[]>(() => {
    const siblings = 1;
    const totalToShow = siblings * 2 + 5;
    if (total <= totalToShow) return range(1, total);

    const left = Math.max(page - siblings, 1);
    const right = Math.min(page + siblings, total);
    const leftDots = left > 2;
    const rightDots = right < total - 1;

    if (!leftDots && rightDots) return [...range(1, siblings * 2 + 3), "ellipsis", total];
    if (leftDots && !rightDots) return [1, "ellipsis", ...range(total - (siblings * 2 + 2), total)];
    return [1, "ellipsis", ...range(left, right), "ellipsis", total];
  });

  function go(p: number) {
    page = Math.min(Math.max(1, p), total);
  }
</script>

{#if count > perPage}
  <nav class="flex justify-center pt-2" aria-label="Pagination">
    <div class="join">
      <button
        type="button"
        class="join-item btn btn-sm"
        onclick={() => go(page - 1)}
        disabled={page === 1}
        aria-label="Previous page"
      >
        <RiArrowLeftSLine class="size-4" />
      </button>

      {#each items as it, i (i)}
        {#if it === "ellipsis"}
          <span class="join-item btn btn-sm btn-disabled pointer-events-none">…</span>
        {:else}
          <button
            type="button"
            class={cn("join-item btn btn-sm", it === page && "btn-active")}
            aria-current={it === page ? "page" : undefined}
            onclick={() => go(it)}
          >
            {it}
          </button>
        {/if}
      {/each}

      <button
        type="button"
        class="join-item btn btn-sm"
        onclick={() => go(page + 1)}
        disabled={page === total}
        aria-label="Next page"
      >
        <RiArrowRightSLine class="size-4" />
      </button>
    </div>
>>>>>>> 44d77f6faedd3aa3bbfc5a9d7327334914351f3e
  </nav>
{/if}
