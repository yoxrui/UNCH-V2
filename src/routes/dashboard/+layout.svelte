<script lang="ts">
  import SiteHeader from "$lib/components/site-header.svelte";
  import SiteFooter from "$lib/components/site-footer.svelte";
  import Button from "$lib/components/button.svelte";
  import { session } from "$lib/state/session.svelte";
  import { RiLoginBoxLine } from "$lib/icons.js";

  let { children } = $props();
</script>

<SiteHeader />

{#if session.loading}
  <main class="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center px-4 py-20">
    <span class="loading loading-spinner text-muted-foreground size-8"></span>
  </main>
{:else if session.isLoggedIn}
  {@render children()}
{:else}
  <main
    class="mx-auto flex min-h-[50vh] max-w-5xl flex-col items-center justify-center gap-5 px-4 py-20 text-center sm:px-6"
  >
    <div class="space-y-2">
      <h1 class="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
        Log in to view your dashboard
      </h1>
      <p class="text-muted-foreground text-sm">Your saved charts, collections and stats live here.</p>
    </div>
    <Button class="rounded-full" onclick={() => session.login()}>
      <RiLoginBoxLine class="size-4" />
      Log in
    </Button>
  </main>
{/if}

<SiteFooter />
