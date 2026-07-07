<script lang="ts">
  import { emojis, emojiSrc } from "$lib/data/index.js";

  let { text = "", class: className }: { text?: string | null; class?: string } = $props();

  const keys = Object.keys(emojis).map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = new RegExp(`(:(?:${keys.join("|")}):)`, "g");

  type Part = { emoji: false; value: string } | { emoji: true; name: string; src: string };

  const parts = $derived.by<Part[]>(() => {
    if (!text) return [];
    return text
      .split(pattern)
      .filter((p) => p !== "")
      .map((p): Part => {
        const m = p.match(/^:([^:]+):$/);
        if (m) {
          const src = emojiSrc(m[1]);
          if (src) return { emoji: true, name: m[1], src };
        }
        return { emoji: false, value: p };
      });
  });
</script>

<span class={className}>
  {#each parts as part, i (i)}
    {#if part.emoji}
      <img
        src={part.src}
        alt={`:${part.name}:`}
        title={`:${part.name}:`}
        class="inline-block size-[1.4em] align-text-bottom"
        loading="lazy"
        decoding="async"
      />
    {:else}{part.value}{/if}
  {/each}
</span>
