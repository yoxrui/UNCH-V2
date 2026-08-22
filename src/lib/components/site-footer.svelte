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
    {
      heading: "Legal",
      links: [{ label: "DMCA & Copyright", href: "/dmca" }],
    },
  ];
</script>

<footer class="border-border/60 mt-20 border-t">
  <div
    class="text-muted-foreground mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6"
  >
    <div class="max-w-sm space-y-2">
      <div class="relative inline-block">
        <img
          src="/miku-sitting.png"
          alt=""
          aria-hidden="true"
          class="pointer-events-none absolute -top-11 left-0 w-[60px] max-w-none select-none drop-shadow-lg sm:-top-16 sm:-left-1 sm:w-20"
        />
        <span
          class="font-heading from-foreground to-primary bg-linear-to-r bg-clip-text text-2xl font-extrabold tracking-tight text-transparent sm:text-3xl"
          >UntitledCharts</span
        >
      </div>
      <p class="text-xs leading-relaxed">
        A community catalog of Sonolus rhythm-game fan-charts.
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
    <span>© {new Date().getFullYear()} UntitledCharts</span>
    <div class="flex items-center gap-2">
      <a
        href="https://discord.com/invite/untitledcharts"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discord"
        class="hover:text-foreground inline-flex size-7 items-center justify-center rounded-full transition-colors"
      >
        <RiDiscordFill class="size-4" />
      </a>
      <a
        href="https://github.com/UntitledCharts"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
        class="hover:text-foreground inline-flex size-7 items-center justify-center rounded-full transition-colors"
      >
        <RiGithubFill class="size-4" />
      </a>
    </div>
  </div>
</footer>
