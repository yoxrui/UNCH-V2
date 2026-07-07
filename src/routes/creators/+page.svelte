<script lang="ts">
  import SiteHeader from "$lib/components/site-header.svelte";
  import SiteFooter from "$lib/components/site-footer.svelte";
  import CoverArt from "$lib/components/cover-art.svelte";
  import FormattedText from "$lib/components/formatted-text.svelte";
  import { compact } from "$lib/data/index.js";
  import { RiHeart3Fill, RiStackLine, RiStarFill } from "$lib/icons.js";

  let { data } = $props();
</script>

<svelte:head>
  <title>Creators — UntitledCharts</title>
</svelte:head>

<SiteHeader />

<main class="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
  <header class="space-y-1">
    <h1 class="font-heading text-2xl font-bold tracking-tight">Creators</h1>
    <p class="text-muted-foreground text-sm">
      The charters behind the catalog, ranked by total likes across their charts.
    </p>
  </header>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {#each data.charters as c (c.account.sonolus_id)}
      <article
        class="group bg-card hover:ring-primary/40 relative flex items-center gap-3.5 rounded-2xl p-4 ring-1 ring-border/70 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/5 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <CoverArt
          id={c.account.sonolus_id}
          title={c.account.sonolus_username}
          rounded="rounded-2xl"
          class="size-14 text-lg"
        />
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <h2 class="truncate font-semibold">
              <a
                href={`/creators/${c.account.sonolus_handle}`}
                class="hover:text-primary after:absolute after:inset-0 after:content-['']"
                ><FormattedText text={c.account.sonolus_username} /></a
              >
            </h2>
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
          </div>
          <p class="text-muted-foreground/70 text-xs tabular-nums">#{c.account.sonolus_handle}</p>
          <div class="text-muted-foreground mt-2 flex items-center gap-3 text-xs tabular-nums">
            <span class="inline-flex items-center gap-1" title="charts">
              <RiStackLine class="size-3.5" />{c.chartCount}
            </span>
            <span class="inline-flex items-center gap-1" title="total likes">
              <RiHeart3Fill class="size-3.5 text-rose-400" />{compact(c.totalLikes)}
            </span>
            {#if c.staffPicks > 0}
              <span class="inline-flex items-center gap-1 text-amber-500" title="staff picks">
                <RiStarFill class="size-3.5" />{c.staffPicks}
              </span>
            {/if}
          </div>
        </div>
      </article>
    {/each}
  </div>
</main>

<SiteFooter />
