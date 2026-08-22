<script lang="ts">
  import Button from "$lib/components/button.svelte";
<<<<<<< HEAD
  import UserProfileNav from "$lib/components/user-profile-nav.svelte";
=======
>>>>>>> 44d77f6faedd3aa3bbfc5a9d7327334914351f3e
  import { cn } from "$lib/utils.js";
  import { page } from "$app/state";
  import { toggleMode } from "mode-watcher";
  import { RiSunLine, RiMoonLine } from "$lib/icons.js";

  const links = [
    { label: "Home", href: "/" },
    { label: "Browse", href: "/browse" },
    { label: "Rankings", href: "/rankings" },
    { label: "Creators", href: "/creators" },
  ];

  function isActive(href: string) {
    return href === "/" ? page.url.pathname === "/" : page.url.pathname.startsWith(href);
  }
</script>

<header class="sticky top-4 z-40 w-full px-4">
  <div
    class="bg-background/70 supports-backdrop-filter:bg-background/55 mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 rounded-full border px-3 pl-5 shadow-lg backdrop-blur-xl sm:px-4 sm:pl-6"
  >
    <!-- Logo -->
    <a href="/" class="flex items-center gap-2.5" aria-label="UntitledCharts home">
      <img
        src="/636a8f1e76b38cb1b9eb0a3d88d7df6f.png"
        alt=""
        class="size-6 shrink-0"
        aria-hidden="true"
      />
      <span class="font-heading text-sm font-semibold tracking-tight">UntitledCharts</span>
    </a>

    <!-- Centered nav -->
    <nav class="hidden items-center gap-7 md:flex" aria-label="Primary">
      {#each links as link (link.href)}
        <a
          href={link.href}
          aria-current={isActive(link.href) ? "page" : undefined}
          class={cn(
            "after:bg-primary relative py-1 text-sm transition-colors after:absolute after:-bottom-0.5 after:left-0 after:h-0.5 after:w-full after:scale-x-0 after:transition-transform motion-reduce:after:transition-none",
            isActive(link.href)
              ? "text-foreground after:scale-x-100"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {link.label}
        </a>
      {/each}
    </nav>

    <!-- Right -->
    <div class="flex items-center gap-1.5">
      <Button
        variant="ghost"
        size="icon"
        onclick={toggleMode}
        aria-label="Toggle dark mode"
        class="text-muted-foreground hover:text-foreground rounded-full"
      >
        <RiSunLine class="hidden size-5 dark:block" />
        <RiMoonLine class="size-5 dark:hidden" />
      </Button>
      <UserProfileNav />
    </div>
  </div>
</header>
