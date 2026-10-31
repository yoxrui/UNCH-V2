<script lang="ts">
  import { t } from "$lib/i18n.svelte.js";
  import OwnerChartCard from "$lib/components/owner-chart-card.svelte";
  import ChartSkeleton from "$lib/components/chart-skeleton.svelte";
  import Seo from "$lib/components/seo.svelte";
  import CoverArt from "$lib/components/cover-art.svelte";
  import Button from "$lib/components/button.svelte";
  import Select from "$lib/components/select.svelte";
  import Sheet from "$lib/components/sheet.svelte";
  import { cn } from "$lib/utils.js";
  import { session } from "$lib/state/session.svelte";
  import { fetchMyCharts, sortByOptions, orderOptions, type Chart, type SortBy } from "$lib/data/index.js";
  import { RiUpload2Line, RiSearchLine, RiEqualizerLine } from "$lib/icons.js";
  import Pager from "$lib/components/pager.svelte";
  import { prefs } from "$lib/state/preferences.svelte.js";
  import { recallPage, rememberPage, recallValue, rememberValue } from "$lib/state/page-memory.js";

  const user = $derived(session.user);

  type Status = "ALL" | "PUBLIC" | "UNLISTED" | "PRIVATE";
  const statusOptions: { value: Status; label: string }[] = [
    { value: "ALL", get label() { return t("dashboard.statusAll"); } },
    { value: "PUBLIC", get label() { return t("dashboard.statusPublic"); } },
    { value: "UNLISTED", get label() { return t("dashboard.statusUnlisted"); } },
    { value: "PRIVATE", get label() { return t("dashboard.statusPrivate"); } },
  ];

  const PER_PAGE = 12;
  let search = $state("");
  let sortBy = $state<SortBy>(recallValue("dashboard:sortBy", sortByOptions.map((o) => o.value), "created_at"));
  let sortOrder = $state<"asc" | "desc">(recallValue("dashboard:order", ["asc", "desc"] as const, "desc"));
  let status = $state<Status>(recallValue("dashboard:status", ["ALL", "PUBLIC", "UNLISTED", "PRIVATE"] as const, "ALL"));
  let dashPage = $state(recallPage("dashboard:charts"));

  $effect(() => {
    rememberValue("dashboard:sortBy", sortBy, "created_at");
    rememberValue("dashboard:order", sortOrder, "desc");
    rememberValue("dashboard:status", status, "ALL");
    rememberPage("dashboard:charts", dashPage);
  });

  let filterSig = "";
  $effect(() => {
    const sig = `${search.trim()}|${status}|${sortBy}|${sortOrder}`;
    if (filterSig && sig !== filterSig) dashPage = 1;
    filterSig = sig;
  });
  let filtersOpen = $state(false);

  const activeFilters = $derived(
    (status !== "ALL" ? 1 : 0) + (sortBy !== "created_at" || sortOrder !== "desc" ? 1 : 0),
  );

  let allMyCharts = $state<Chart[]>([]);
  let loading = $state(true);
  let reqToken = 0;
  $effect(() => {
    const loggedIn = session.isLoggedIn;
    const key = session.sessionKey;
    const q = search.trim();
    const sb = sortBy;
    const so = sortOrder;
    if (!loggedIn || !key) {
      allMyCharts = [];
      loading = false;
      return;
    }
    const mine = ++reqToken;
    loading = true;
    const params: Record<string, string | number> = {
      status: "ALL",
      sort_by: sb,
      sort_order: so,
      limit: 48,
    };
    if (q) params.meta_includes = q;
    fetchMyCharts(fetch, key, params)
      .then(async (first) => {
        const rest = await Promise.all(
          Array.from({ length: Math.max(0, first.pageCount - 1) }, (_, i) =>
            fetchMyCharts(fetch, key, { ...params, page: i + 1 }),
          ),
        );
        return [first, ...rest].flatMap((r) => r.data);
      })
      .then((charts) => {
        if (mine !== reqToken) return;
        allMyCharts = charts;
        loading = false;
      });
  });

  const myCharts = $derived(
    status === "ALL" ? allMyCharts : allMyCharts.filter((c) => c.status === status),
  );
  const pageCount = $derived(Math.max(1, Math.ceil(myCharts.length / PER_PAGE)));
  const visibleCharts = $derived.by(() => {
    const current = Math.min(dashPage, pageCount);
    return myCharts.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  });

  const chip = "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors";
  const chipActive = "border-primary/50 bg-primary/10 text-primary";
  const chipInactive = "border-border text-muted-foreground";
</script>

<Seo title={t("dashboard.title")} image="/og?title=Dashboard&subtitle=Your+uploaded+charts" />

<main class="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:space-y-10 sm:px-6 sm:py-8">
  <section class="flex items-center gap-4">
    <CoverArt
      id={user?.username ?? "guest"}
      title={user?.username ?? "?"}
      src={user?.avatar ?? null}
      rounded="rounded-2xl"
      class="size-14 shrink-0 sm:size-16"
    />
    <div class="min-w-0">
      <p class="text-muted-foreground text-sm">{t("dashboard.welcomeBack")}</p>
      <h1 class="font-heading truncate text-2xl font-bold tracking-tight sm:text-3xl">
        {user?.username ?? "there"}
      </h1>
    </div>
  </section>

  <section class="space-y-5">
    <div class="flex items-end justify-between gap-3">
      <div class="space-y-0.5">
        <h2 class="font-heading text-lg font-semibold tracking-tight">{t("dashboard.yourCharts")}</h2>
        <p class="text-muted-foreground text-sm">{t("dashboard.chartsYouVeUploaded")}</p>
      </div>
      <Button href="/dashboard/upload" size="sm" class="shrink-0 rounded-full">
        <RiUpload2Line class="size-4" />
        {t("dashboard.uploadANewChart")}
      </Button>
    </div>

    <div class="flex items-center gap-2.5">
      <div class="relative min-w-0 flex-1">
        <RiSearchLine
          class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <input
          bind:value={search}
          type="search"
          placeholder={t("dashboard.searchYourCharts")}
          aria-label={t("dashboard.searchYourCharts2")}
          class="bg-card focus-visible:ring-ring/50 h-10 w-full rounded-xl border pr-3 pl-9 text-sm outline-none focus-visible:ring-2"
        />
      </div>

      <Select bind:value={status} options={statusOptions} label={t("dashboard.status")} ariaLabel={t("dashboard.status")} class="hidden w-36 sm:block" />
      <Select bind:value={sortBy} options={sortByOptions} label={t("dashboard.sort")} ariaLabel={t("dashboard.sortBy")} class="hidden w-44 sm:block" />
      <Select bind:value={sortOrder} options={orderOptions} label={t("search.order")} ariaLabel={t("search.order")} class="hidden w-36 sm:block" />

      <button
        type="button"
        onclick={() => (filtersOpen = true)}
        class={cn(
          "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium sm:hidden",
          activeFilters > 0 ? "border-primary/40 bg-primary/10 text-primary" : "bg-card",
        )}
      >
        <RiEqualizerLine class="size-4" />
        {t("dashboard.filters")}
        {#if activeFilters > 0}
          <span
            class="bg-primary text-primary-foreground grid size-5 place-items-center rounded-full text-[11px] font-bold tabular-nums"
            >{activeFilters}</span
          >
        {/if}
      </button>
    </div>

    {#if loading}
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {#each Array(6) as _, i (i)}
          <ChartSkeleton />
        {/each}
      </div>
    {:else if myCharts.length === 0}
      {#if search.trim() || status !== "ALL"}
        <div
          class="text-muted-foreground flex flex-col items-center gap-2 rounded-2xl border border-dashed py-16 text-center text-sm"
        >
          <RiSearchLine class="size-8 opacity-50" />
          <p>{t("dashboard.noChartsMatchYourFilters")}</p>
        </div>
      {:else}
        <div
          class="text-muted-foreground flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center text-sm"
        >
          <RiUpload2Line class="size-8 opacity-50" />
          <p>{t("dashboard.youHavenTUploadedAny")}</p>
          <Button href="/dashboard/upload" size="sm" variant="outline" class="rounded-full">
            {t("dashboard.uploadANewChart")}
          </Button>
        </div>
      {/if}
    {:else}
      <div
        class={cn(
          "grid gap-5",
          prefs.dashboardCards === "cover" ? "grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6" : "grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {#each visibleCharts as chart (chart.id)}
          <OwnerChartCard {chart} />
        {/each}
      </div>
      <Pager count={myCharts.length} perPage={PER_PAGE} bind:page={dashPage} />
    {/if}
  </section>
</main>

<Sheet bind:open={filtersOpen}>
  <div class="space-y-5 px-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
    <h3 class="font-heading text-lg font-semibold tracking-tight">{t("dashboard.filters")}</h3>

    <section class="space-y-2">
      <h4 class="text-muted-foreground text-xs font-semibold">{t("dashboard.status")}</h4>
      <div class="flex flex-wrap gap-2">
        {#each statusOptions as o (o.value)}
          <button
            type="button"
            onclick={() => (status = o.value)}
            aria-pressed={status === o.value}
            class={cn(chip, status === o.value ? chipActive : chipInactive)}>{o.label}</button
          >
        {/each}
      </div>
    </section>

    <section class="space-y-2">
      <h4 class="text-muted-foreground text-xs font-semibold">{t("dashboard.sortBy")}</h4>
      <div class="flex flex-wrap gap-2">
        {#each sortByOptions as o (o.value)}
          <button
            type="button"
            onclick={() => (sortBy = o.value)}
            aria-pressed={sortBy === o.value}
            class={cn(chip, sortBy === o.value ? chipActive : chipInactive)}>{o.label}</button
          >
        {/each}
      </div>
    </section>

    <section class="space-y-2">
      <h4 class="text-muted-foreground text-xs font-semibold">{t("search.order")}</h4>
      <div class="flex gap-2">
        {#each orderOptions as o (o.value)}
          <button
            type="button"
            onclick={() => (sortOrder = o.value)}
            aria-pressed={sortOrder === o.value}
            class={cn(chip, "flex-1", sortOrder === o.value ? chipActive : chipInactive)}
            >{o.label}</button
          >
        {/each}
      </div>
    </section>

    <button
      type="button"
      onclick={() => (filtersOpen = false)}
      class="bg-primary text-primary-foreground flex h-11 w-full items-center justify-center rounded-2xl text-sm font-semibold"
    >
      {t("dashboard.showResults")}
    </button>
  </div>
</Sheet>
