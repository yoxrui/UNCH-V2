<script lang="ts">
  import { cn } from "$lib/utils.js";
  import Button from "./button.svelte";
  import CoverArt from "./cover-art.svelte";
  import Sheet from "./sheet.svelte";
  import { session } from "$lib/state/session.svelte";
  import {
    RiDashboardLine,
    RiSettings3Line,
    RiLogoutBoxRLine,
    RiLoginBoxLine,
    RiArrowDownSLine,
  } from "$lib/icons.js";

  const user = $derived(session.user);

  // Shared by both the desktop dropdown and the mobile sheet.
  const menuItems = [
    { label: "Dashboard", href: "/dashboard", icon: RiDashboardLine },
    { label: "Settings", href: "/dashboard/settings", icon: RiSettings3Line },
  ];

  let open = $state(false); // desktop <details>
  let sheetOpen = $state(false); // mobile sheet
  let root = $state<HTMLDetailsElement>();

  function close() {
    open = false;
    sheetOpen = false;
  }

  // Native <details> only toggles from its <summary>, so close the dropdown on an
  // outside click / Escape ourselves. Mirrors select.svelte.
  $effect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (root && !root.contains(e.target as Node)) open = false;
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") open = false;
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  });
</script>

{#snippet menuList()}
  {#each menuItems as item (item.href)}
    {@const Icon = item.icon}
    <li>
      <a href={item.href} onclick={close} class="gap-2.5">
        <Icon class="size-4 shrink-0" />
        {item.label}
      </a>
    </li>
  {/each}
  <li><hr class="border-border/60 my-1" /></li>
  <li>
    <button
      type="button"
      onclick={() => {
        session.logout();
        close();
      }}
      class="gap-2.5 text-rose-500 dark:text-rose-400"
    >
      <RiLogoutBoxRLine class="size-4 shrink-0" />
      Logout
    </button>
  </li>
{/snippet}

{#if session.loading}
  <div class="bg-muted size-8 animate-pulse rounded-full md:size-9"></div>
{:else if session.isLoggedIn && user}
  <!-- Desktop: DaisyUI dropdown (mirrors select.svelte) -->
  <details bind:this={root} bind:open class="dropdown dropdown-end hidden md:block">
    <summary
      aria-label="Profile menu"
      class={cn(
        "focus-visible:ring-ring/50 relative flex h-9 cursor-pointer list-none items-center gap-2 overflow-hidden rounded-full border pr-2.5 pl-1 outline-none transition-colors select-none focus-visible:ring-2 [&::-webkit-details-marker]:hidden",
        !user.banner && "hover:bg-accent/60",
      )}
      style={user.banner
        ? `background-image:url(${user.banner});background-size:cover;background-position:center`
        : undefined}
    >
      {#if user.banner}
        <span class="pointer-events-none absolute inset-0 bg-black/45"></span>
      {/if}
      <CoverArt
        id={user.username}
        title={user.username}
        src={user.avatar}
        rounded="rounded-full"
        class={cn("relative z-10 size-7", user.banner && "ring-2 ring-white/40")}
      />
      <span
        class={cn(
          "relative z-10 hidden text-sm font-medium lg:inline",
          user.banner && "text-white drop-shadow",
        )}>{user.username}</span
      >
      <RiArrowDownSLine
        class={cn(
          "relative z-10 size-4 transition-transform",
          open && "rotate-180",
          user.banner ? "text-white/80" : "text-muted-foreground",
        )}
      />
    </summary>
    <ul
      class="bg-popover/85 dropdown-content menu ring-foreground/10 z-50 mt-2 w-60 rounded-xl p-1.5 shadow-lg ring-1 backdrop-blur-2xl backdrop-saturate-150"
    >
      <li>
        <a href={`/creators/${user.handle}`} onclick={close} class="!py-2">
          <CoverArt
            id={user.username}
            title={user.username}
            src={user.avatar}
            rounded="rounded-full"
            class="size-9 shrink-0"
          />
          <div class="min-w-0">
            <p class="text-foreground truncate text-sm font-semibold">{user.username}</p>
            <p class="text-muted-foreground text-xs">View profile</p>
          </div>
        </a>
      </li>
      {@render menuList()}
    </ul>
  </details>

  <!-- Mobile: avatar button → bottom sheet -->
  <button
    type="button"
    onclick={() => (sheetOpen = true)}
    aria-label="Open profile menu"
    class="flex items-center md:hidden"
  >
    <CoverArt
      id={user.username}
      title={user.username}
      src={user.avatar}
      rounded="rounded-full"
      class="size-8"
    />
  </button>
  <Sheet bind:open={sheetOpen}>
    <a
      href={`/creators/${user.handle}`}
      onclick={close}
      class="hover:bg-muted/60 mx-2 mt-2 flex items-center gap-3 rounded-xl px-2 py-2 transition-colors"
    >
      <CoverArt
        id={user.username}
        title={user.username}
        src={user.avatar}
        rounded="rounded-full"
        class="size-11 shrink-0"
      />
      <div class="min-w-0">
        <p class="font-heading font-semibold">{user.username}</p>
        <p class="text-muted-foreground text-sm">View profile</p>
      </div>
    </a>
    <ul class="menu w-full gap-0.5 px-2 pb-[calc(1rem+env(safe-area-inset-bottom))] text-base">
      {@render menuList()}
    </ul>
  </Sheet>
{:else}
  <Button size="sm" class="rounded-full" onclick={() => session.login()}>
    <RiLoginBoxLine class="size-4" />
    Login
  </Button>
{/if}
