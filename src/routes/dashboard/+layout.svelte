<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import SiteHeader from "$lib/components/site-header.svelte";
  import SiteFooter from "$lib/components/site-footer.svelte";
  import { session } from "$lib/state/session.svelte";

  let { children } = $props();

  $effect(() => {
    if (!session.loading && !session.isLoggedIn) {
      const dest = page.url.pathname + page.url.search;
      goto(`/login?next=${encodeURIComponent(dest)}`, { replaceState: true });
    }
  });
</script>

<SiteHeader />

{#if session.loading || !session.isLoggedIn}
  <main class="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center px-4 py-20">
    <span class="loading loading-spinner text-muted-foreground size-8"></span>
  </main>
{:else}
  {@render children()}
{/if}

<SiteFooter />
