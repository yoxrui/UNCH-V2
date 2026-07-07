<script lang="ts">
  import { RiGithubFill, RiDiscordFill } from "$lib/icons.js";

  const groups = [
    {
      heading: "Browse",
      links: [
        { label: "All charts", href: "/browse" },
        { label: "Rankings", href: "/rankings" },
        { label: "Creators", href: "/creators" },
      ],
    },
  ];
</script>

<footer class="border-border/60 mt-20 border-t">
  <div
    class="text-muted-foreground mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6"
  >
    <div class="max-w-sm space-y-2">
      <span class="font-heading text-foreground text-sm font-semibold">UntitledCharts</span>
      <p class="text-xs leading-relaxed">
        A community catalog of Sonolus rhythm-game fan-charts. This is a front-end demo running on
        mock data shaped to the public API — no account or backend required.
      </p>
    </div>

    <div class="flex gap-12">
      {#each groups as group (group.heading)}
        <nav class="space-y-2" aria-label={group.heading}>
          <p class="text-foreground text-xs font-semibold">{group.heading}</p>
          <ul class="space-y-1.5">
            {#each group.links as link (link.href)}
              <li>
                <a href={link.href} class="hover:text-foreground text-xs transition-colors"
                  >{link.label}</a
                >
              </li>
            {/each}
          </ul>
        </nav>
      {/each}
    </div>
  </div>

  <div
    class="border-border/60 text-muted-foreground/70 mx-auto flex max-w-7xl items-center justify-between gap-4 border-t px-4 py-4 text-[11px] sm:px-6"
  >
    <span>© {new Date().getFullYear()} UntitledCharts · demo build</span>
    <div class="flex items-center gap-2">
      <span
        class="hover:text-foreground inline-flex size-7 items-center justify-center rounded-full transition-colors"
        aria-hidden="true"
      >
        <RiDiscordFill class="size-4" />
      </span>
      <span
        class="hover:text-foreground inline-flex size-7 items-center justify-center rounded-full transition-colors"
        aria-hidden="true"
      >
        <RiGithubFill class="size-4" />
      </span>
    </div>
  </div>
</footer>
