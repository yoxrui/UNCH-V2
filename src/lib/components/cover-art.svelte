<script lang="ts">
  import { cn } from "$lib/utils.js";
  import { coverGradient } from "$lib/data/index.js";

  let {
    id,
    title = "",
    ring,
    rounded = "rounded-xl",
    class: className,
  }: {
    /** Stable seed for the gradient (chart or account id). */
    id: string;
    /** Used only for the initial glyph; the title always appears as text nearby. */
    title?: string;
    /** Optional Tailwind ring-* color class (e.g. a difficulty ring). */
    ring?: string;
    rounded?: string;
    class?: string;
  } = $props();

  const gradient = $derived(coverGradient(id));
  const initial = $derived((title.trim()[0] ?? "♪").toUpperCase());
</script>

<!--
  Decorative gradient placeholder: the real API exposes only asset *hashes* and
  the fetch path is unknown (see README.md). The seed keeps each cover stable
  and distinct. Marked aria-hidden — the title is always shown as adjacent text.
-->
<div
  class={cn(
    "relative isolate flex shrink-0 items-center justify-center overflow-hidden bg-linear-to-br shadow-md",
    gradient,
    rounded,
    ring && `ring-2 ${ring}`,
    className,
  )}
  aria-hidden="true"
>
  <span
    class="absolute -top-1/4 -left-1/4 size-3/4 rounded-full bg-white/20 blur-2xl"
  ></span>
  <span class="font-heading text-2xl font-bold text-white/85 drop-shadow-sm select-none"
    >{initial}</span
  >
</div>
