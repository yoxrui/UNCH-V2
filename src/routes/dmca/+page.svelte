<script lang="ts">
  import SiteHeader from "$lib/components/site-header.svelte";
  import SiteFooter from "$lib/components/site-footer.svelte";
  import Button from "$lib/components/button.svelte";
  import { RiArrowLeftLine, RiDiscordFill } from "$lib/icons.js";

  const DISCORD = "https://discord.com/invite/untitledcharts";

  const steps: { title: string; body: string; discord?: boolean; gif?: string }[] = [
    {
      title: "Reach out on Discord",
      body: "The fastest way to report infringing content is to join the UntitledCharts Discord and open a ticket in the support channel. A moderator will guide you through the process.",
      discord: true,
      gif: "/guidegifs/guide1.gif",
    },
    {
      title: "Identify the work",
      body: "Provide a link to the chart on UntitledCharts and a description or link to the original copyrighted work you own the rights to.",
      gif: "/guidegifs/guide2.gif",
    },
    {
      title: "Confirm ownership",
      body: "State that you are the copyright owner (or authorised to act on their behalf) and that the use of the material is not authorised by you, your agent, or the law.",
    },
    {
      title: "Review & takedown",
      body: "Once verified, the reported chart is taken down. The uploader is notified and may file a counter-notice if they believe the removal was a mistake.",
    },
  ];
</script>

<svelte:head>
  <title>DMCA & Copyright | UntitledCharts</title>
</svelte:head>

<SiteHeader />

<main class="mx-auto max-w-3xl space-y-8 px-4 py-8 sm:px-6">
  <a
    href="/"
    class="text-muted-foreground hover:text-foreground group inline-flex items-center gap-1.5 text-sm transition-colors"
  >
    <RiArrowLeftLine
      class="size-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none"
    />
    Home
  </a>

  <header class="space-y-2">
    <h1 class="font-heading text-3xl font-bold tracking-tight">DMCA & Copyright</h1>
    <p class="text-muted-foreground text-sm leading-relaxed">
      UntitledCharts respects the intellectual property of others. If you believe content on the
      platform infringes your copyright, follow the steps below to request a takedown.
    </p>
  </header>

  <ol class="space-y-4">
    {#each steps as step, i (step.title)}
      <li class="bg-card ring-border/70 flex gap-4 rounded-2xl border p-5 ring-1">
        <span
          class="bg-primary text-primary-foreground grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold tabular-nums"
          >{i + 1}</span
        >
        <div class="min-w-0 flex-1 space-y-3">
          <div class="space-y-1">
            <h2 class="font-heading font-semibold tracking-tight">{step.title}</h2>
            <p class="text-muted-foreground text-sm leading-relaxed">{step.body}</p>
          </div>
          {#if step.discord}
            <a href={DISCORD} target="_blank" rel="noopener noreferrer">
              <Button class="rounded-full">
                <RiDiscordFill class="size-4" />
                Join the Discord
              </Button>
            </a>
          {/if}
          {#if step.gif}
            <div class="ring-border/70 overflow-hidden rounded-xl border ring-1">
              <img src={step.gif} alt={`${step.title} guide`} loading="lazy" class="w-full" />
            </div>
          {/if}
        </div>
      </li>
    {/each}
  </ol>

  <section class="bg-card ring-border/70 space-y-2 rounded-2xl border p-5 ring-1">
    <h2 class="font-heading font-semibold tracking-tight">Counter-notice</h2>
    <p class="text-muted-foreground text-sm leading-relaxed">
      If your chart was removed and you believe it was a mistake or misidentification, you can submit
      a counter-notice through the same Discord support channel. Include the chart link and an
      explanation of why the content should be restored.
    </p>
  </section>
</main>

<SiteFooter />
