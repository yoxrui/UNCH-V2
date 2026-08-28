<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import SiteHeader from "$lib/components/site-header.svelte";
  import SiteFooter from "$lib/components/site-footer.svelte";
  import Button from "$lib/components/button.svelte";
  import { session } from "$lib/state/session.svelte";
  import { RiLoginBoxLine } from "$lib/icons.js";

  function safeNext(raw: string | null): string {
    if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
    return "/dashboard";
  }

  const next = $derived(safeNext(page.url.searchParams.get("next")));

  $effect(() => {
    if (!session.loading && session.isLoggedIn) {
      goto(next, { replaceState: true });
    }
  });
</script>

<svelte:head>
  <title>Log in | UntitledCharts</title>
</svelte:head>

<SiteHeader />

<main class="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center px-4 py-16 sm:px-6">
  {#if session.loading || session.isLoggedIn}
    <span class="loading loading-spinner text-muted-foreground size-8"></span>
  {:else}
    <div class="bg-card ring-border/70 w-full rounded-2xl border ring-1">
      <div class="border-b px-6 py-5">
        <p class="text-muted-foreground font-mono text-[11px] font-medium tracking-[0.18em] uppercase">
          Sign in
        </p>
        <h1 class="font-heading mt-2 text-xl font-bold tracking-tight">Log in with Sonolus</h1>
      </div>
      <div class="space-y-4 px-6 py-5">
        <p class="text-muted-foreground text-sm">
          You'll be taken to <code class="font-mono text-xs">{next}</code> once you're signed in.
        </p>
        <Button onclick={() => session.login()} disabled={session.pending} class="w-full rounded-lg">
          <RiLoginBoxLine class="size-4" />
          {session.pending ? "Waiting for confirmation…" : "Log in with Sonolus"}
        </Button>
      </div>
    </div>
  {/if}
</main>

<SiteFooter />
