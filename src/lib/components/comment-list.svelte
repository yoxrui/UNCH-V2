<script lang="ts">
  import type { Comment } from "$lib/data/index.js";
  import { relativeTime } from "$lib/data/index.js";
  import CoverArt from "./cover-art.svelte";

  let { comments }: { comments: Comment[] } = $props();
</script>

<ul class="space-y-4">
  {#each comments as c (c.id)}
    <li class="flex gap-3">
      <CoverArt
        id={c.account.sonolus_id}
        title={c.account.sonolus_username}
        rounded="rounded-full"
        class="size-9 text-sm"
      />
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span class="text-sm font-semibold">{c.account.sonolus_username}</span>
          <span class="text-muted-foreground/70 text-xs tabular-nums">#{c.account.sonolus_handle}</span>
          {#if c.account.admin}
            <span
              class="rounded border border-rose-400/40 bg-rose-400/15 px-1 py-px text-[9px] font-bold text-rose-600 dark:text-rose-300"
              >ADMIN</span
            >
          {:else if c.account.mod}
            <span
              class="rounded border border-violet-400/40 bg-violet-400/15 px-1 py-px text-[9px] font-bold text-violet-600 dark:text-violet-300"
              >MOD</span
            >
          {/if}
          <span class="text-muted-foreground/70 text-xs">· {relativeTime(c.created_at)}</span>
        </div>
        <p class="text-foreground/90 mt-0.5 text-sm wrap-break-word whitespace-pre-line">{c.content}</p>
      </div>
    </li>
  {/each}
</ul>
