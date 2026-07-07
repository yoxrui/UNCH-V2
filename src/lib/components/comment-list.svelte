<script lang="ts">
  import type { Comment } from "$lib/data/index.js";
  import { relativeTime, profileUrl } from "$lib/data/index.js";
  import CoverArt from "./cover-art.svelte";
  import FormattedText from "./formatted-text.svelte";

  let { comments }: { comments: Comment[] } = $props();
</script>

<ul class="space-y-4">
  {#each comments as c (c.id)}
    <li class="flex gap-3">
      <a href={`/creators/${c.account.sonolus_handle}`} class="shrink-0" aria-label={c.account.sonolus_username}>
        <CoverArt
          id={c.account.sonolus_id}
          title={c.account.sonolus_username}
          src={profileUrl(c.account)}
          rounded="rounded-full"
          class="size-9 text-sm"
        />
      </a>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <a href={`/creators/${c.account.sonolus_handle}`} class="text-sm font-semibold">
            {c.account.sonolus_username}
          </a>
          <a
            href={`/creators/${c.account.sonolus_handle}`}
            class="text-muted-foreground/70! text-xs tabular-nums"
          >@{c.account.sonolus_handle}</a>

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
        <p class="text-foreground/90 mt-0.5 text-sm wrap-break-word whitespace-pre-line">
          <FormattedText text={c.content} />
        </p>
      </div>
    </li>
  {/each}
</ul>
