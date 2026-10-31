<script lang="ts">
  import type { Chart } from "$lib/data/index.js";
  import { compact, coverUrl } from "$lib/data/index.js";
  import CoverArt from "./cover-art.svelte";
  import LevelBadge from "./level-badge.svelte";
  import FormattedText from "./formatted-text.svelte";
  import Sheet from "./sheet.svelte";
  import { RiHeart3Fill, RiChat3Line, RiStarFill, RiEditLine, RiExternalLinkLine, RiLinksLine, RiCheckLine } from "$lib/icons.js";
  import { t } from "$lib/i18n.svelte.js";
  import { cn } from "$lib/utils.js";
  import { prefs } from "$lib/state/preferences.svelte.js";
  import { SITE_URL } from "$lib/config.js";

  let { chart }: { chart: Chart } = $props();

  const editHref = $derived(`/dashboard/edit/UnCh-${chart.id}`);
  const viewHref = $derived(`/levels/UnCh-${chart.id}`);

  const cover = $derived(coverUrl(chart));
  const coverOnly = $derived(prefs.dashboardCards === "cover");
  const statusLabel = $derived(
    chart.status === "PUBLIC" ? t("dashboard.statusPublic") : chart.status === "UNLISTED" ? t("dashboard.statusUnlisted") : t("dashboard.statusPrivate"),
  );
  const shareable = $derived(chart.status === "PUBLIC" || chart.status === "UNLISTED");
  let copied = $state(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${SITE_URL}${viewHref}`);
      copied = true;
      setTimeout(() => (copied = false), 1500);
    } catch {
      void 0;
    }
  }

  let drawerOpen = $state(false);
</script>

{#snippet status()}
  <span
    class={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
      chart.staff_pick ? "bg-amber-400 text-amber-950" : "bg-muted text-muted-foreground",
    )}
  >
    {#if chart.staff_pick}<RiStarFill class="size-2.5" /> {t("common.staff")}{:else}{statusLabel}{/if}
  </span>
{/snippet}

{#if coverOnly}
  <article class="group bg-card relative overflow-hidden rounded-2xl">
    <CoverArt id={chart.id} title={chart.title} src={cover} rounded="rounded-none" class="aspect-square w-full" />
    <LevelBadge level={chart.rating} size="sm" onImage class="absolute top-2 left-2" />
    <div class="p-2.5">
      <h3 class="truncate text-xs font-bold"><FormattedText text={chart.title} /></h3>
      <p class="text-muted-foreground truncate text-[11px]">{statusLabel}</p>
    </div>
    <a href={editHref} class="absolute inset-0" aria-label={t("dashboard.actionsFor", [chart.title])}></a>
  </article>
{:else}
  <article class="group bg-card relative flex items-center gap-3 rounded-2xl p-2.5">
    <CoverArt id={chart.id} title={chart.title} src={cover} rounded="rounded-xl" class="size-18 shrink-0" />

    <div class="min-w-0 flex-1">
      <div class="flex items-center gap-1.5">
        <LevelBadge level={chart.rating} size="sm" />
        {@render status()}
      </div>
      <h3 class="mt-1 truncate text-sm font-bold"><FormattedText text={chart.title} /></h3>
      <p class="text-muted-foreground truncate text-xs"><FormattedText text={chart.artists} /></p>
      <p class="text-muted-foreground mt-0.5 flex items-center gap-3 text-[11px] tabular-nums [&>span]:inline-flex [&>span]:items-center [&>span]:gap-1">
        <span><RiHeart3Fill class="size-3 text-rose-400" />{compact(chart.like_count)}</span>
        <span><RiChat3Line class="size-3" />{compact(chart.comment_count)}</span>
      </p>
    </div>

    <div class="hidden shrink-0 flex-col gap-1 sm:flex">
      <a href={editHref} aria-label={t("dashboard.edit")} title={t("dashboard.edit")} class="bg-primary text-primary-foreground grid size-8 place-items-center rounded-full transition-[filter] hover:brightness-110">
        <RiEditLine class="size-4" />
      </a>
      {#if shareable}
        <a href={viewHref} aria-label={t("dashboard.view")} title={t("dashboard.view")} class="hover:bg-muted text-muted-foreground hover:text-foreground grid size-8 place-items-center rounded-full transition-colors">
          <RiExternalLinkLine class="size-4" />
        </a>
        <button type="button" onclick={copyLink} aria-label={t("dashboard.copyLink")} title={copied ? t("levelDetail.linkCopied") : t("dashboard.copyLink")} class="hover:bg-muted text-muted-foreground hover:text-foreground grid size-8 place-items-center rounded-full transition-colors">
          {#if copied}<RiCheckLine class="size-4" />{:else}<RiLinksLine class="size-4" />{/if}
        </button>
      {/if}
    </div>

    <button
      type="button"
      onclick={() => (drawerOpen = true)}
      aria-label={t("dashboard.actionsFor", [chart.title])}
      class="absolute inset-0 sm:hidden"
    ></button>
  </article>
{/if}

<Sheet bind:open={drawerOpen}>
  <div class="p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
    <div class="flex flex-col items-center gap-2 px-4 pt-3 pb-4 text-center">
      <CoverArt
        id={chart.id}
        title={chart.title}
        src={coverUrl(chart)}
        rounded="rounded-2xl"
        class="ring-border/70 size-20 ring-1"
      />
      <div class="min-w-0 max-w-full">
        <p class="truncate text-base font-semibold tracking-tight">
          <FormattedText text={chart.title} />
        </p>
        <p class="text-muted-foreground truncate text-sm"><FormattedText text={chart.artists} /></p>
      </div>
    </div>
    <a
      href={editHref}
      class="hover:bg-muted flex items-center gap-3 rounded-xl px-3 py-3.5 text-[15px] font-medium"
    >
      <RiEditLine class="size-5 shrink-0" />
      {t("dashboard.edit")}
    </a>
    {#if shareable}
      <a
        href={viewHref}
        class="hover:bg-muted flex items-center gap-3 rounded-xl px-3 py-3.5 text-[15px] font-medium"
      >
        <RiExternalLinkLine class="size-5 shrink-0" />
        {t("dashboard.viewPage")}
      </a>
      <button
        type="button"
        onclick={copyLink}
        class="hover:bg-muted flex w-full items-center gap-3 rounded-xl px-3 py-3.5 text-left text-[15px] font-medium"
      >
        {#if copied}<RiCheckLine class="size-5 shrink-0" />{:else}<RiLinksLine class="size-5 shrink-0" />{/if}
        {copied ? t("levelDetail.linkCopied") : t("dashboard.copyLink")}
      </button>
    {/if}
  </div>
</Sheet>
