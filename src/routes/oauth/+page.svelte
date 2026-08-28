<script lang="ts">
  import { page } from "$app/state";
  import { goto } from "$app/navigation";
  import SiteHeader from "$lib/components/site-header.svelte";
  import SiteFooter from "$lib/components/site-footer.svelte";
  import Button from "$lib/components/button.svelte";
  import CoverArt from "$lib/components/cover-art.svelte";
  import { session } from "$lib/state/session.svelte";
  import { API_URL } from "$lib/data/index.js";
  import { RiErrorWarningLine, RiLoginBoxLine } from "$lib/icons.js";

  type Scope = { scope: string; description?: string };
  type AppInfo = { name: string; description?: string; redirect_uri: string; scopes: Scope[] };

  const params = $derived(page.url.searchParams);
  const isAuthorizeRequest = $derived(!!params.get("client_id"));
  const ready = $derived(!session.loading);
  const loggedIn = $derived(session.isLoggedIn && !!session.sessionKey);
  const user = $derived(session.user);

  let app = $state<AppInfo | null>(null);
  let error = $state<string | null>(null);
  let submitting = $state(false);
  let confirmed = $state(false);
  let loadedKey = $state("");
  let authorized = $state(false);
  let showRedirectNote = $state(false);

  async function loadAuthorize(key: string) {
    error = null;
    app = null;
    confirmed = false;
    const query = new URLSearchParams({
      client_id: params.get("client_id") ?? "",
      redirect_uri: params.get("redirect_uri") ?? "",
      scope: params.get("scope") ?? "",
      response_type: params.get("response_type") ?? "code",
    });
    const codeChallenge = params.get("code_challenge");
    if (codeChallenge) query.set("code_challenge", codeChallenge);
    try {
      const res = await fetch(`${API_URL}/api/oauth/authorize/?${query}`, {
        headers: { Authorization: key },
      });
      const data = await res.json();
      if (!res.ok) {
        error = data.message || "This authorization request is not valid.";
        return;
      }
      app = data;
    } catch {
      error = "Couldn't reach the server. Please try again.";
    }
  }

  async function authorize() {
    const key = session.sessionKey;
    if (!key || !app) return;
    submitting = true;
    error = null;
    const body: Record<string, unknown> = {
      client_id: params.get("client_id"),
      redirect_uri: params.get("redirect_uri"),
      scopes: app.scopes.map((s) => s.scope),
    };
    const state = params.get("state");
    const codeChallenge = params.get("code_challenge");
    if (state) body.state = state;
    if (codeChallenge) {
      body.code_challenge = codeChallenge;
      body.code_challenge_method = params.get("code_challenge_method") || "S256";
    }
    try {
      const res = await fetch(`${API_URL}/api/oauth/authorize/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: key },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}) as Record<string, unknown>);
      const message = typeof data.message === "string" ? data.message : "";
      const alreadyAuthorized = !res.ok && /already/i.test(message);
      submitting = false;
      if (res.ok || alreadyAuthorized) {
        authorized = true;
        if (typeof data.redirect_uri === "string" && data.redirect_uri) {
          window.location.href = data.redirect_uri;
        }
        setTimeout(() => (showRedirectNote = true), 2000);
        setTimeout(() => goto("/dashboard/settings"), 22000);
        return;
      }
      error = message || `Could not authorize this app (HTTP ${res.status}).`;
    } catch {
      error = "Couldn't reach the server. Please try again.";
      submitting = false;
    }
  }

  function deny() {
    const redirect = params.get("redirect_uri");
    const state = params.get("state");
    if (redirect) {
      try {
        const u = new URL(redirect);
        u.searchParams.set("error", "access_denied");
        if (state) u.searchParams.set("state", state);
        window.location.href = u.toString();
        return;
      } catch {
        void 0;
      }
    }
    goto("/dashboard/settings");
  }

  $effect(() => {
    if (ready && !isAuthorizeRequest) {
      goto("/dashboard/settings");
      return;
    }
    const key = session.sessionKey;
    if (!ready || !loggedIn || !key || !isAuthorizeRequest) return;
    const signature = `${params.toString()}:${key}`;
    if (signature === loadedKey) return;
    loadedKey = signature;
    loadAuthorize(key);
  });
</script>

<svelte:head>
  <title>Authorize app | UntitledCharts</title>
</svelte:head>

<SiteHeader />

<main class="mx-auto flex max-w-md flex-col px-4 py-12 sm:px-6">
  {#if !ready || (loggedIn && isAuthorizeRequest && !app && !error)}
    <div class="flex min-h-[45vh] flex-col items-center justify-center gap-4">
      <span class="text-muted-foreground text-sm">Verifying request…</span>
      <span class="loading loading-spinner text-primary"></span>
    </div>
  {:else if !loggedIn}
    <div class="bg-card ring-border/70 rounded-2xl border ring-1">
      <div class="border-b px-6 py-5">
        <p class="text-muted-foreground text-xs font-medium">Authorization request</p>
        <h1 class="font-heading mt-2 text-xl font-bold tracking-tight">Sign in to continue</h1>
      </div>
      <div class="space-y-4 px-6 py-5">
        <p class="text-muted-foreground text-sm">
          Log in with Sonolus to review what this app is asking for.
        </p>
        <Button onclick={() => session.login()} disabled={session.pending} class="w-full rounded-lg">
          <RiLoginBoxLine class="size-4" />
          {session.pending ? "Waiting for confirmation…" : "Log in with Sonolus"}
        </Button>
      </div>
    </div>
  {:else if error && !app}
    <div class="bg-card ring-border/70 rounded-2xl border ring-1">
      <div class="flex items-center gap-2 border-b px-6 py-5 text-rose-500">
        <RiErrorWarningLine class="size-5 shrink-0" />
        <h1 class="font-heading text-lg font-bold tracking-tight">Request rejected</h1>
      </div>
      <div class="space-y-4 px-6 py-5">
        <p class="text-muted-foreground text-sm">{error}</p>
        <Button href="/dashboard/settings" variant="outline" class="rounded-lg">Back to settings</Button>
      </div>
    </div>
  {:else if app}
    <div class="bg-card ring-border/70 overflow-hidden rounded-2xl border ring-1">
      <div class="px-6 py-6 sm:px-7">
        <h1 class="font-heading text-2xl leading-tight font-bold tracking-tight">{app.name}</h1>
        <p class="text-muted-foreground mt-1 text-sm">
          wants to connect to your UntitledCharts account
        </p>

        <div class="mt-4 inline-flex items-center gap-2 rounded-full border py-1 pr-3 pl-1">
          <CoverArt
            id={user?.username ?? "guest"}
            title={user?.username ?? "?"}
            src={user?.avatar}
            rounded="rounded-full"
            class="size-6"
          />
          <span class="text-sm font-medium">{user?.username ?? ""}</span>
          <span class="text-muted-foreground/70 font-mono text-xs">#{user?.handle ?? ""}</span>
        </div>
      </div>

      <div class="border-t px-6 py-5 sm:px-7">
        <h2 class="text-sm font-semibold">What {app.name} will be able to do</h2>
        <ul class="divide-border/60 mt-1 divide-y">
          {#each app.scopes as s (s.scope)}
            <li class="flex gap-3 py-3">
              <span class="bg-primary mt-1 h-3.5 w-[3px] shrink-0 rounded-full"></span>
              <div class="min-w-0">
                <p class="text-sm leading-snug font-medium">{s.description || s.scope}</p>
                <code class="text-muted-foreground/60 font-mono text-xs">{s.scope}</code>
              </div>
            </li>
          {/each}
        </ul>
        <p class="text-muted-foreground mt-4 text-xs">
          You can revoke this at any time from Authorized Apps.
        </p>
      </div>

      <div class="bg-muted/30 space-y-4 border-t px-6 py-5 sm:px-7">
        {#if error}
          <p class="rounded-lg border border-rose-400/40 bg-rose-400/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">
            {error}
          </p>
        {/if}

        <label class="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            bind:checked={confirmed}
            disabled={authorized}
            class="checkbox checkbox-primary checkbox-sm mt-0.5"
          />
          <span class="text-muted-foreground text-sm">
            I trust <span class="text-foreground font-medium">{app.name}</span> and grant it the access
            listed above.
          </span>
        </label>
        <div class="flex gap-3">
          <Button onclick={deny} variant="ghost" disabled={submitting || authorized} class="flex-1 rounded-lg">
            Deny
          </Button>
          <Button
            onclick={authorize}
            disabled={submitting || authorized || !confirmed}
            class="flex-[1.4] rounded-lg"
          >
            {authorized ? "Authorized" : submitting ? "Authorizing…" : "Authorize access"}
          </Button>
        </div>

        {#if showRedirectNote}
          <p class="text-muted-foreground text-center text-xs">
            Redirecting to Settings in 20 seconds…
          </p>
        {/if}
      </div>
    </div>
  {/if}
</main>

<SiteFooter />
