<script lang="ts">
  import { page } from "$app/state";
  import { cn } from "$lib/utils.js";
  import {
    RiHome5Line,
    RiHome5Fill,
    RiCompass3Line,
    RiCompass3Fill,
    RiSearchLine,
    RiTrophyLine,
    RiTrophyFill,
    RiTeamLine,
    RiTeamFill,
  } from "remixicon-svelte";

  const path = $derived(page.url.pathname);
  const isHome = $derived(path === "/");
  const isBrowse = $derived(path.startsWith("/browse"));
  const isRankings = $derived(path.startsWith("/rankings"));
  const isCreators = $derived(path.startsWith("/creators"));
</script>

<!-- Primary navigation for mobile (the top bar collapses to logo + theme). -->
<nav
  aria-label="Primary"
  class="bg-background/85 supports-backdrop-filter:bg-background/70 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
>
  <div class="mx-auto grid h-16 max-w-md grid-cols-5">
    <a
      href="/"
      aria-current={isHome ? "page" : undefined}
      class={cn(
        "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
        isHome ? "text-primary" : "text-muted-foreground",
      )}
    >
      {#if isHome}<RiHome5Fill class="size-6" />{:else}<RiHome5Line class="size-6" />{/if}
      Home
    </a>

    <a
      href="/browse"
      aria-current={isBrowse ? "page" : undefined}
      class={cn(
        "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
        isBrowse ? "text-primary" : "text-muted-foreground",
      )}
    >
      {#if isBrowse}<RiCompass3Fill class="size-6" />{:else}<RiCompass3Line class="size-6" />{/if}
      Browse
    </a>

    <!-- Center: quick search → focuses the search field on Browse -->
    <a
      href="/browse?focus=1"
      aria-label="Search charts"
      class="flex flex-col items-center justify-center"
    >
      <span
        class="bg-primary text-primary-foreground -mt-5 grid size-13 place-items-center rounded-full shadow-lg shadow-primary/30 ring-4 ring-background transition-transform active:scale-95"
      >
        <RiSearchLine class="size-6" />
      </span>
      <span class="text-muted-foreground -mt-0.5 text-[10px] font-medium">Search</span>
    </a>

    <a
      href="/rankings"
      aria-current={isRankings ? "page" : undefined}
      class={cn(
        "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
        isRankings ? "text-primary" : "text-muted-foreground",
      )}
    >
      {#if isRankings}<RiTrophyFill class="size-6" />{:else}<RiTrophyLine class="size-6" />{/if}
      Rankings
    </a>

    <a
      href="/creators"
      aria-current={isCreators ? "page" : undefined}
      class={cn(
        "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
        isCreators ? "text-primary" : "text-muted-foreground",
      )}
    >
      {#if isCreators}<RiTeamFill class="size-6" />{:else}<RiTeamLine class="size-6" />{/if}
      Creators
    </a>
  </div>
</nav>
