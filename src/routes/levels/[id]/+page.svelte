<script lang="ts">
  import SiteHeader from "$lib/components/site-header.svelte";
  import SiteFooter from "$lib/components/site-footer.svelte";
  import CoverArt from "$lib/components/cover-art.svelte";
  import DifficultyBadge from "$lib/components/difficulty-badge.svelte";
  import TrendsChart from "$lib/components/trends-chart.svelte";
  import LeaderboardTable from "$lib/components/leaderboard-table.svelte";
  import CommentList from "$lib/components/comment-list.svelte";
  import Pager from "$lib/components/pager.svelte";
  import Waveform from "$lib/components/waveform.svelte";
  import ChartSection from "$lib/components/chart-section.svelte";
  import FormattedText from "$lib/components/formatted-text.svelte";
  import { cn } from "$lib/utils.js";
  import {
    fetchLeaderboard,
    fetchComments,
    difficultyFromTags,
    compact,
    grouped,
    relativeTime,
    LEADERBOARD_TYPES,
    leaderboardMeta,
    coverUrl,
    bgmProxyUrl,
    type LeaderboardType,
    type ScoreEntry,
    type Comment,
  } from "$lib/data/index.js";
  import {
    RiArrowLeftLine,
    RiHeart3Fill,
    RiChat3Line,
    RiStarFill,
    RiPulseLine,
    RiMusic2Line,
    RiTimeLine,
    RiTrophyLine,
    RiShareLine,
  } from "$lib/icons.js";

  let { data } = $props();
  const chart = $derived(data.chart);
  const difficulty = $derived(difficultyFromTags(chart.tags, chart.rating));

  const sonolusLink = $derived(`https://open.sonolus.com/untitledcharts.com/levels/UnCh-${chart.id}`);
  let shareLabel = $state("Share");

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: chart.title, url });
      } catch {
        void 0;
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      shareLabel = "Copied!";
      setTimeout(() => (shareLabel = "Share"), 1500);
    } catch {
      void 0;
    }
  }

  const PERPAGE = 10;

  // Leaderboard state
  let lbType = $state<LeaderboardType>("arcade_score_speed");
  let lbPage = $state(1);
  let lb = $state<{ data: ScoreEntry[]; pageCount: number }>({ data: [], pageCount: 1 });
  let lbLoading = $state(true);
  // Reset to page 1 when the metric changes.
  $effect(() => {
    lbType;
    lbPage = 1;
  });
  let lbToken = 0;
  $effect(() => {
    const type = lbType;
    const p = lbPage;
    const id = chart.id;
    const mine = ++lbToken;
    lbLoading = true;
    fetchLeaderboard(fetch, id, type, p - 1, PERPAGE).then((r) => {
      if (mine !== lbToken) return;
      lb = r;
      lbLoading = false;
    });
  });

  // Comments state
  let cPage = $state(1);
  let cm = $state<{ data: Comment[]; pageCount: number }>({ data: [], pageCount: 1 });
  let cmLoading = $state(true);
  let cmToken = 0;
  $effect(() => {
    const p = cPage;
    const id = chart.id;
    const mine = ++cmToken;
    cmLoading = true;
    fetchComments(fetch, id, p - 1, PERPAGE).then((r) => {
      if (mine !== cmToken) return;
      cm = r;
      cmLoading = false;
    });
  });
</script>

<svelte:head>
  <title>{chart.title} — UntitledCharts</title>
</svelte:head>

<SiteHeader />

<main class="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
  <a
    href="/browse"
    class="text-muted-foreground hover:text-foreground group inline-flex items-center gap-1.5 text-sm transition-colors"
  >
    <RiArrowLeftLine class="size-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none" />
    Browse
  </a>

  <!-- Header -->
  <section class="bg-card rounded-3xl border p-4 sm:p-6">
    <div class="flex flex-col gap-5 sm:flex-row sm:gap-6">
      <CoverArt
        id={chart.id}
        title={chart.title}
        src={coverUrl(chart)}
        rounded="rounded-2xl"
        class="aspect-square w-full shrink-0 sm:size-44 md:size-52"
      />

      <div class="flex min-w-0 flex-1 flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          {#if chart.staff_pick}
            <span
              class="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-amber-400/15 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-amber-600 dark:text-amber-300"
            >
              <RiStarFill class="size-3" /> STAFF PICK
            </span>
          {/if}
          <DifficultyBadge {difficulty} level={chart.rating} />
          <span
            class="text-muted-foreground border-border rounded-full border px-2 py-0.5 text-[11px] font-medium"
            >{chart.status}</span
          >
        </div>

        <div class="min-w-0 space-y-1.5">
          <h1 class="font-heading text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            <FormattedText text={chart.title} />
          </h1>
          <p class="text-muted-foreground text-sm">
            <FormattedText text={chart.artists} /> ·
            <span>charted by</span>
            <a
              href={`/creators/${chart.author_handle}`}
              class="font-medium text-sky-600 hover:text-sky-500 dark:text-sky-400 dark:hover:text-sky-300"
              >{chart.chart_design}</a
            >
          </p>
        </div>

        <!-- Stats -->
        <div class="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <span class="inline-flex items-center gap-1.5 tabular-nums">
            <span class="heart-pop inline-flex origin-center">
              <RiHeart3Fill class="size-4 text-rose-400" />
            </span>
            <span class="font-semibold">{grouped(chart.like_count)}</span>
            <span class="text-muted-foreground">likes</span>
          </span>
          <span class="inline-flex items-center gap-1.5 tabular-nums">
            <RiChat3Line class="text-muted-foreground size-4" />
            <span class="font-semibold">{grouped(chart.comment_count)}</span>
            <span class="text-muted-foreground">comments</span>
          </span>
        </div>

        <!-- Parsed-from-description meta (the only place the API exposes these) -->
        {#if data.meta.bpm || data.meta.notes || data.meta.combo}
          <div class="flex flex-wrap gap-2 pt-0.5">
            {#if data.meta.bpm}
              <span
                class="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs"
              >
                <RiPulseLine class="size-3.5" />{data.meta.bpm} BPM
              </span>
            {/if}
            {#if data.meta.notes}
              <span
                class="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs tabular-nums"
              >
                <RiMusic2Line class="size-3.5" />{grouped(data.meta.notes)} notes
              </span>
            {/if}
            {#if data.meta.combo}
              <span
                class="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs tabular-nums"
              >
                {grouped(data.meta.combo)} combo
              </span>
            {/if}
          </div>
        {/if}

        <p class="text-muted-foreground/80 mt-auto inline-flex items-center gap-1.5 text-xs">
          <RiTimeLine class="size-3.5" />
          Published {relativeTime(chart.published_at)} · updated {relativeTime(chart.updated_at)}
        </p>
      </div>
    </div>

    {#if chart.description}
      <p class="text-foreground/90 mt-5 border-t pt-5 text-sm leading-relaxed whitespace-pre-line">
        <FormattedText text={chart.description} />
      </p>
    {/if}

    {#if chart.tags.length}
      <div class="mt-4 flex flex-wrap gap-1.5">
        {#each chart.tags as tag (tag)}
          <span class="bg-muted/60 text-muted-foreground rounded px-2 py-0.5 text-xs">#{tag}</span>
        {/each}
      </div>
    {/if}
  </section>

  <div class="flex gap-3">
    <!-- needs improvement with the design -->
    <a
      href={sonolusLink}
      target="_blank"
      rel="noopener noreferrer"
      class="flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
      style="background-color: #000020"
    >
      <span>Open in</span>
      <img src="https://sonolus.com/logo.png" alt="Sonolus" class="h-4 w-auto" />
    </a>
    <button
      type="button"
      onclick={share}
      class="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-zinc-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-500"
    >
      <RiShareLine class="size-4" />
      <span>{shareLabel}</span>
    </button>
  </div>

  <section class="bg-card rounded-3xl border p-4 sm:p-6">
    <div class="mb-3 flex items-center justify-between gap-3">
      <h2 class="font-heading inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
        <RiMusic2Line class="text-primary size-5" /> Preview
      </h2>
    </div>
    <Waveform id={chart.id} src={bgmProxyUrl(chart)} variant="full" />
  </section>

  <!-- Trends -->
  <section class="bg-card rounded-3xl border p-4 sm:p-6">
    <h2 class="font-heading mb-4 text-lg font-semibold tracking-tight">Activity</h2>
    <TrendsChart likes={data.trends.likes} comments={data.trends.comments} />
  </section>

  <!-- Leaderboard -->
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h2 class="font-heading inline-flex items-center gap-2 text-lg font-semibold tracking-tight">
        <RiTrophyLine class="text-amber-500 size-5" /> Leaderboard
      </h2>
    </div>

    <div class="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
      {#each LEADERBOARD_TYPES as t (t)}
        <button
          type="button"
          onclick={() => (lbType = t)}
          aria-pressed={lbType === t}
          class={cn(
            "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium whitespace-nowrap transition-colors",
            lbType === t
              ? "bg-primary text-primary-foreground border-transparent"
              : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30",
          )}
        >
          {leaderboardMeta[t].short}
        </button>
      {/each}
    </div>
    <p class="text-muted-foreground text-xs">{leaderboardMeta[lbType].blurb}</p>

    {#if !lbLoading && lb.data.length === 0}
      <div
        class="text-muted-foreground flex flex-col items-center gap-2 rounded-2xl border border-dashed py-14 text-sm"
      >
        <RiTrophyLine class="size-8 opacity-40" />
        No scores submitted yet — be the first to play it.
      </div>
    {:else}
      <LeaderboardTable entries={lb.data} type={lbType} startRank={(lbPage - 1) * PERPAGE + 1} />
      <Pager count={lb.pageCount * PERPAGE} perPage={PERPAGE} bind:page={lbPage} />
    {/if}
  </section>

  <!-- Comments -->
  <section class="space-y-4">
    <h2 class="font-heading text-lg font-semibold tracking-tight">
      Comments <span class="text-muted-foreground font-normal tabular-nums">· {chart.comment_count}</span>
    </h2>

    {#if !cmLoading && cm.data.length === 0}
      <div
        class="text-muted-foreground flex flex-col items-center gap-2 rounded-2xl border border-dashed py-14 text-sm"
      >
        <RiChat3Line class="size-8 opacity-40" />
        No comments yet.
      </div>
    {:else}
      <div class="bg-card rounded-2xl border p-4 sm:p-5">
        <CommentList comments={cm.data} />
      </div>
      <Pager count={cm.pageCount * PERPAGE} perPage={PERPAGE} bind:page={cPage} />
    {/if}
  </section>

  <!-- Related -->
  {#if data.related.length}
    <ChartSection title="Related charts" charts={data.related} carousel />
  {/if}
</main>

<SiteFooter />
