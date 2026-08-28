<script lang="ts">
  import OwnerChartCard from "$lib/components/owner-chart-card.svelte";
  import ChartSkeleton from "$lib/components/chart-skeleton.svelte";
  import CoverArt from "$lib/components/cover-art.svelte";
  import Button from "$lib/components/button.svelte";
  import Select from "$lib/components/select.svelte";
  import Sheet from "$lib/components/sheet.svelte";
  import { cn } from "$lib/utils.js";
  import { session } from "$lib/state/session.svelte";
  import { fetchMyCharts, sortByOptions, orderOptions, type Chart, type SortBy } from "$lib/data/index.js";
  import { RiUpload2Line, RiSearchLine, RiEqualizerLine } from "$lib/icons.js";

  const user = $derived(session.user);

  type Status = "ALL" | "PUBLIC" | "UNLISTED" | "PRIVATE";
  const statusOptions: { value: Status; label: string }[] = [
    { value: "ALL", label: "All" },
    { value: "PUBLIC", label: "Public" },
    { value: "UNLISTED", label: "Unlisted" },
    { value: "PRIVATE", label: "Private" },
  ];

  let search = $state("");
  let sortBy = $state<SortBy>("created_at");
  let sortOrder = $state<"asc" | "desc">("desc");
  let status = $state<Status>("ALL");
  let filtersOpen = $state(false);

  const activeFilters = $derived(
    (status !== "ALL" ? 1 : 0) + (sortBy !== "created_at" || sortOrder !== "desc" ? 1 : 0),
  );

  // Fetch stays scoped to the signed-in user via status=ALL (+ auth); status is
  // filtered client-side because status=PUBLIC would return the global feed.
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
    fetchMyCharts(fetch, key, params).then((r) => {
      if (mine !== reqToken) return;
      allMyCharts = r.data;
      loading = false;
    });
  });

  const myCharts = $derived(
    status === "ALL" ? allMyCharts : allMyCharts.filter((c) => c.status === status),
  );

  const chip = "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors";
  const chipActive = "border-primary/50 bg-primary/10 text-primary";
  const chipInactive = "border-border text-muted-foreground";
</script>

<svelte:head>
  <title>Dashboard | UntitledCharts</title>
</svelte:head>

<main class="mx-auto max-w-5xl space-y-8 px-4 py-6 sm:space-y-10 sm:px-6 sm:py-8">
  <!-- Welcome -->
  <section class="flex items-center gap-4">
    <CoverArt
      id={user?.username ?? "guest"}
      title={user?.username ?? "?"}
      src={user?.avatar ?? null}
      rounded="rounded-2xl"
      class="size-14 shrink-0 sm:size-16"
    />
    <div class="min-w-0">
      <p class="text-muted-foreground text-sm">Welcome back,</p>
      <h1 class="font-heading truncate text-2xl font-bold tracking-tight sm:text-3xl">
        {user?.username ?? "there"}
      </h1>
    </div>
  </section>

  <!-- Your charts -->
  <section class="space-y-5">
    <div class="flex items-end justify-between gap-3">
      <div class="space-y-0.5">
        <h2 class="font-heading text-lg font-semibold tracking-tight">Your charts</h2>
        <p class="text-muted-foreground text-sm">Charts you've uploaded.</p>
      </div>
      <Button href="/dashboard/upload" size="sm" class="shrink-0 rounded-full">
        <RiUpload2Line class="size-4" />
        Upload a New Chart
      </Button>
    </div>

    <!-- filters -->
    <div class="flex items-center gap-2.5">
      <div class="relative min-w-0 flex-1">
        <RiSearchLine
          class="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <input
          bind:value={search}
          type="search"
          placeholder="Search your charts…"
          aria-label="Search your charts"
          class="bg-card focus-visible:ring-ring/50 h-10 w-full rounded-xl border pr-3 pl-9 text-sm outline-none focus-visible:ring-2"
        />
      </div>

      <!-- Desktop: inline selects -->
      <Select bind:value={status} options={statusOptions} label="Status" ariaLabel="Status" class="hidden w-36 sm:block" />
      <Select bind:value={sortBy} options={sortByOptions} label="Sort" ariaLabel="Sort by" class="hidden w-44 sm:block" />
      <Select bind:value={sortOrder} options={orderOptions} label="Order" ariaLabel="Order" class="hidden w-36 sm:block" />

      <!-- Mobile: filters button opens a sheet -->
      <button
        type="button"
        onclick={() => (filtersOpen = true)}
        class={cn(
          "inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-sm font-medium sm:hidden",
          activeFilters > 0 ? "border-primary/40 bg-primary/10 text-primary" : "bg-card",
        )}
      >
        <RiEqualizerLine class="size-4" />
        Filters
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
          <p>No charts match your filters.</p>
        </div>
      {:else}
        <div
          class="text-muted-foreground flex flex-col items-center gap-3 rounded-2xl border border-dashed py-16 text-center text-sm"
        >
          <RiUpload2Line class="size-8 opacity-50" />
          <p>You haven't uploaded any charts yet.</p>
          <Button href="/dashboard/upload" size="sm" variant="outline" class="rounded-full">
            Upload a New Chart
          </Button>
        </div>
      {/if}
    {:else}
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {#each myCharts as chart (chart.id)}
          <OwnerChartCard {chart} />
        {/each}
      </div>
    {/if}
  </section>
</main>

<!-- Mobile filters sheet -->
<Sheet bind:open={filtersOpen}>
  <div class="space-y-5 px-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
    <h3 class="font-heading text-lg font-semibold tracking-tight">Filters</h3>

    <section class="space-y-2">
      <h4 class="text-muted-foreground text-xs font-semibold">Status</h4>
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
      <h4 class="text-muted-foreground text-xs font-semibold">Sort by</h4>
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
      <h4 class="text-muted-foreground text-xs font-semibold">Order</h4>
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
      Show results
    </button>
  </div>
</Sheet>
