<script lang="ts">
  import { t } from "$lib/i18n.svelte.js";
  import SiteHeader from "$lib/components/site-header.svelte";
  import SiteFooter from "$lib/components/site-footer.svelte";
  import Seo from "$lib/components/seo.svelte";
  import { RiArrowLeftLine, RiDiscordFill, RiArrowDownSLine } from "$lib/icons.js";

  const DISCORD = "https://discord.com/invite/untitledcharts";
  const UPDATED = "2026-09-28";

  const sections = [
    { id: "notice", title: "dmca.policyNoticeTitle" },
    { id: "submit", title: "dmca.policySubmitTitle" },
    { id: "review", title: "dmca.policyReviewTitle" },
    { id: "counter", title: "dmca.policyCounterTitle" },
    { id: "repeat", title: "dmca.policyRepeatTitle" },
    { id: "misuse", title: "dmca.policyMisuseTitle" },
  ];

  const noticeItems = [1, 2, 3, 4, 5, 6].map((n) => `dmca.policyNoticeItem${n}`);
  const counterItems = [1, 2, 3, 4, 5].map((n) => `dmca.policyCounterItem${n}`);
  const ticketSteps = [
    { text: "dmca.policyTicketStep1", gif: "/guidegifs/guide1.gif" },
    { text: "dmca.policyTicketStep2", gif: "/guidegifs/guide2.gif" },
  ];

  const updated = $derived(
    new Date(`${UPDATED}T00:00:00Z`).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" }),
  );
</script>

<Seo
  title={t("footer.dmca")}
  description={t("dmca.policyIntro")}
  image="/og?title=DMCA+%26+Copyright&subtitle=Copyright+and+takedown+policy"
/>

<SiteHeader />

<main class="mx-auto max-w-5xl px-4 py-8 sm:px-6">
  <a
    href="/"
    class="text-muted-foreground hover:text-foreground group inline-flex items-center gap-1.5 text-sm transition-colors"
  >
    <RiArrowLeftLine class="size-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none" />
    {t("nav.home")}
  </a>

  <header class="border-border/70 mt-6 space-y-3 border-b pb-8">
    <p class="text-primary text-xs font-semibold tracking-widest uppercase">{t("footer.legal")}</p>
    <h1 class="font-heading text-3xl font-bold tracking-tight sm:text-4xl">{t("dmca.policyTitle")}</h1>
    <p class="text-muted-foreground text-sm">{t("dmca.policyUpdated", [updated])}</p>
    <p class="text-foreground/85 max-w-2xl text-[15px] leading-relaxed">{t("dmca.policyIntro")}</p>
  </header>

  <div class="mt-8 grid gap-10 lg:grid-cols-[200px_minmax(0,1fr)]">
    <nav aria-label={t("dmca.policyContents")} class="hidden lg:block">
      <div class="sticky top-24 space-y-2">
        <p class="text-muted-foreground text-xs font-semibold tracking-wide uppercase">{t("dmca.policyContents")}</p>
        <ol class="space-y-1.5 text-sm">
          {#each sections as s, i (s.id)}
            <li>
              <a href={`#${s.id}`} class="text-muted-foreground hover:text-foreground flex gap-2 transition-colors">
                <span class="tabular-nums">{i + 1}.</span>
                <span>{t(s.title)}</span>
              </a>
            </li>
          {/each}
        </ol>
      </div>
    </nav>

    <article class="min-w-0 space-y-10 text-[15px] leading-relaxed">
      <section id="notice" class="scroll-mt-24 space-y-3">
        <h2 class="font-heading text-xl font-semibold tracking-tight">1. {t("dmca.policyNoticeTitle")}</h2>
        <p class="text-foreground/85">{t("dmca.policyNoticeBody")}</p>
        <ol class="text-foreground/85 list-[lower-alpha] space-y-2 pl-6">
          {#each noticeItems as item (item)}
            <li class="pl-1">{t(item)}</li>
          {/each}
        </ol>
      </section>

      <section id="submit" class="scroll-mt-24 space-y-4">
        <h2 class="font-heading text-xl font-semibold tracking-tight">2. {t("dmca.policySubmitTitle")}</h2>
        <p class="text-foreground/85">{t("dmca.policySubmitBody")}</p>
        <div class="bg-card flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div class="space-y-1">
            <p class="font-semibold">{t("dmca.policySubmitCardTitle")}</p>
            <p class="text-muted-foreground text-sm">{t("dmca.policySubmitCardBody")}</p>
          </div>
          <a
            href={DISCORD}
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#5865F2] px-4 text-sm font-semibold text-white! transition-opacity hover:opacity-90"
          >
            <RiDiscordFill class="size-4" />
            {t("dmca.joinTheDiscord")}
          </a>
        </div>
        <details class="group bg-card rounded-2xl border">
          <summary class="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 text-sm font-semibold [&::-webkit-details-marker]:hidden">
            {t("dmca.policyTicketGuide")}
            <RiArrowDownSLine class="text-muted-foreground size-5 transition-transform group-open:rotate-180" />
          </summary>
          <ol class="space-y-5 border-t px-5 py-5">
            {#each ticketSteps as step, i (step.text)}
              <li class="space-y-2">
                <p class="text-foreground/85 text-sm"><span class="font-semibold tabular-nums">{i + 1}.</span> {t(step.text)}</p>
                <img src={step.gif} alt={t(step.text)} loading="lazy" class="w-full rounded-xl border" />
              </li>
            {/each}
          </ol>
        </details>
      </section>

      <section id="review" class="scroll-mt-24 space-y-3">
        <h2 class="font-heading text-xl font-semibold tracking-tight">3. {t("dmca.policyReviewTitle")}</h2>
        <p class="text-foreground/85">{t("dmca.policyReviewBody1")}</p>
        <p class="text-foreground/85">{t("dmca.policyReviewBody2")}</p>
      </section>

      <section id="counter" class="scroll-mt-24 space-y-3">
        <h2 class="font-heading text-xl font-semibold tracking-tight">4. {t("dmca.policyCounterTitle")}</h2>
        <p class="text-foreground/85">{t("dmca.policyCounterBody")}</p>
        <ol class="text-foreground/85 list-[lower-alpha] space-y-2 pl-6">
          {#each counterItems as item (item)}
            <li class="pl-1">{t(item)}</li>
          {/each}
        </ol>
        <p class="text-foreground/85">{t("dmca.policyCounterAfter")}</p>
      </section>

      <section id="repeat" class="scroll-mt-24 space-y-3">
        <h2 class="font-heading text-xl font-semibold tracking-tight">5. {t("dmca.policyRepeatTitle")}</h2>
        <p class="text-foreground/85">{t("dmca.policyRepeatBody")}</p>
      </section>

      <section id="misuse" class="scroll-mt-24 space-y-3">
        <h2 class="font-heading text-xl font-semibold tracking-tight">6. {t("dmca.policyMisuseTitle")}</h2>
        <p class="text-foreground/85">{t("dmca.policyMisuseBody")}</p>
      </section>

      <p class="text-muted-foreground border-t pt-6 text-xs leading-relaxed">{t("dmca.policyDisclaimer")}</p>
    </article>
  </div>
</main>

<SiteFooter />
