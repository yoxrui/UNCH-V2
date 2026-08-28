<script lang="ts">
  import Button from "./button.svelte";
  import { session } from "$lib/state/session.svelte";
  import { API_URL } from "$lib/data/index.js";
  import { RiCheckLine, RiDeleteBinLine } from "$lib/icons.js";

  type Scope = { scope: string; description?: string };
  type AuthorizedApp = {
    client_id: string;
    name: string;
    description?: string;
    scopes: Scope[];
    authorized_at: string;
  };

  let apps = $state<AuthorizedApp[] | null>(null);
  let error = $state<string | null>(null);
  let revoking = $state<string | null>(null);
  let loadedKey = $state("");

  async function loadApps(key: string) {
    error = null;
    apps = null;
    try {
      const res = await fetch(`${API_URL}/api/oauth/authorizations/`, {
        headers: { Authorization: key },
      });
      if (!res.ok) throw new Error("failed");
      apps = await res.json();
    } catch {
      error = "Couldn't load your authorized apps.";
      apps = [];
    }
  }

  async function revoke(clientId: string) {
    const key = session.sessionKey;
    if (!key) return;
    revoking = clientId;
    try {
      const res = await fetch(`${API_URL}/api/oauth/authorizations/${clientId}/`, {
        method: "DELETE",
        headers: { Authorization: key },
      });
      if (!res.ok) throw new Error("failed");
      await loadApps(key);
    } catch {
      error = "Couldn't revoke that app.";
    }
    revoking = null;
  }

  function formatDate(value: string): string {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  $effect(() => {
    const key = session.sessionKey;
    if (session.loading || !session.isLoggedIn || !key) return;
    if (key === loadedKey) return;
    loadedKey = key;
    loadApps(key);
  });
</script>

<section class="bg-card ring-border/70 space-y-4 rounded-2xl border p-5 ring-1">
  <div class="space-y-0.5">
    <h2 class="font-heading font-semibold">Authorized apps</h2>
    <p class="text-muted-foreground text-sm">
      Apps you've given access to your account. Revoking takes effect immediately.
    </p>
  </div>

  {#if error}
    <p class="rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-2.5 text-sm text-rose-600 dark:text-rose-300">
      {error}
    </p>
  {/if}

  {#if apps === null}
    <div class="grid place-items-center py-10">
      <span class="loading loading-spinner loading-md text-primary"></span>
    </div>
  {:else if apps.length === 0}
    <p class="text-muted-foreground rounded-xl border border-dashed py-10 text-center text-sm">
      You haven't authorized any apps yet.
    </p>
  {:else}
    <ul class="space-y-3">
      {#each apps as a (a.client_id)}
        <li class="ring-border/70 space-y-3 rounded-xl border p-4 ring-1">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <h3 class="font-semibold tracking-tight">{a.name}</h3>
              {#if a.description}
                <p class="text-muted-foreground text-sm">{a.description}</p>
              {/if}
            </div>
            <Button
              onclick={() => revoke(a.client_id)}
              disabled={revoking === a.client_id}
              variant="destructive"
              size="sm"
              class="shrink-0 rounded-full"
            >
              <RiDeleteBinLine class="size-4" />
              {revoking === a.client_id ? "Revoking…" : "Revoke"}
            </Button>
          </div>

          <ul class="space-y-1.5">
            {#each a.scopes as s (s.scope)}
              <li class="bg-muted/40 flex items-start gap-2.5 rounded-lg px-3 py-2">
                <RiCheckLine class="text-primary mt-0.5 size-4 shrink-0" />
                <div class="min-w-0">
                  <p class="text-sm font-medium">{s.description || s.scope}</p>
                  <code class="text-muted-foreground/70 text-xs">{s.scope}</code>
                </div>
              </li>
            {/each}
          </ul>

          <p class="text-muted-foreground/70 text-xs">Authorized on {formatDate(a.authorized_at)}</p>
        </li>
      {/each}
    </ul>
  {/if}
</section>
