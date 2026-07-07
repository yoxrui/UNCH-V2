<script lang="ts">
  import { difficultyMeta, type Difficulty } from "$lib/data/index.js";
  import { cn } from "$lib/utils.js";

  let {
    difficulty,
    level,
    size = "md",
    class: className,
  }: { difficulty: Difficulty; level?: number; size?: "sm" | "md"; class?: string } = $props();

  const meta = $derived(difficultyMeta[difficulty]);
</script>

<span
  class={cn(
    "inline-flex items-center gap-1.5 rounded-md border font-bold tracking-wide whitespace-nowrap backdrop-blur",
    size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
    meta.badge,
    className,
  )}
>
  <span class={cn("badge-dot size-1.5 rounded-full", meta.dot)}></span>
  Lv.{level ?? "?"}
</span>
