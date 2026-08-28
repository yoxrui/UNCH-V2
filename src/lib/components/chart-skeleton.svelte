<script lang="ts">
  let { variant = "card" }: { variant?: "card" | "list" } = $props();
</script>

{#if variant === "list"}
  <article class="bg-card ring-border/70 rounded-2xl ring-1">
    <div class="flex items-stretch gap-3 p-3">
      <div class="bg-muted size-18 shrink-0 animate-pulse rounded-xl"></div>
      <div class="flex min-w-0 flex-1 flex-col gap-2 py-1">
        <div class="bg-muted h-4 w-3/4 animate-pulse rounded"></div>
        <div class="bg-muted h-3 w-1/2 animate-pulse rounded"></div>
        <div class="mt-auto flex items-center justify-between">
          <div class="bg-muted h-3 w-20 animate-pulse rounded"></div>
          <div class="bg-muted h-3 w-12 animate-pulse rounded"></div>
        </div>
      </div>
    </div>
  </article>
{:else}
  <div class="bg-card ring-border/70 relative flex h-full flex-col overflow-hidden rounded-2xl ring-1">
    <div class="relative">
      <div class="bg-muted aspect-16/7 w-full animate-pulse"></div>
      <div class="bg-muted ring-card absolute bottom-0 left-4 size-16 translate-y-1/2 animate-pulse rounded-xl ring-4"></div>
    </div>
    <div class="flex flex-1 flex-col gap-3 px-4 pt-9 pb-4">
      <div class="space-y-2">
        <div class="bg-muted h-4 w-3/4 animate-pulse rounded"></div>
        <div class="bg-muted h-3 w-1/2 animate-pulse rounded"></div>
      </div>
      <div class="mt-auto flex items-center justify-between">
        <div class="bg-muted h-3 w-24 animate-pulse rounded"></div>
        <div class="bg-muted h-3 w-12 animate-pulse rounded"></div>
      </div>
    </div>
  </div>
{/if}
