<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { coverGradient } from "$lib/data/index.js";

  let {
    id,
    title = "",
    src = null,
    ring,
    rounded = "rounded-xl",
    class: className,
  }: {
    id: string;
    title?: string;
    src?: string | null;
    ring?: string;
    rounded?: string;
    class?: string;
  } = $props();

  const gradient = $derived(coverGradient(id));
  const initial = $derived((title.trim()[0] ?? "♪").toUpperCase());

  let failed = $state(false);
  const showImage = $derived(!!src && !failed);
</script>

<div
  class={cn(
    "relative isolate flex shrink-0 items-center justify-center overflow-hidden bg-linear-to-br shadow-md",
    gradient,
    rounded,
    ring && `ring-2 ${ring}`,
    className,
  )}
  aria-hidden={showImage ? undefined : "true"}
>
  {#if showImage}
    <img
      src={src}
      alt={title}
      loading="lazy"
      onerror={() => (failed = true)}
      class="absolute inset-0 size-full object-cover"
    />
  {:else}
    <span
      class="absolute -top-1/4 -left-1/4 size-3/4 rounded-full bg-white/20 blur-2xl"
    ></span>
    <span class="font-heading text-2xl font-bold text-white/85 drop-shadow-sm select-none"
      >{initial}</span
    >
  {/if}
</div>
