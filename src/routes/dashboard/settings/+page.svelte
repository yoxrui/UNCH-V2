<script lang="ts">
  import Button from "$lib/components/button.svelte";
  import CoverArt from "$lib/components/cover-art.svelte";
  import Modal from "$lib/components/modal.svelte";
  import ImageCropper from "$lib/components/image-cropper.svelte";
  import EmojiTextarea from "$lib/components/emoji-textarea.svelte";
  import DifficultyBadge from "$lib/components/difficulty-badge.svelte";
  import AuthorizedApps from "$lib/components/authorized-apps.svelte";
  import { session } from "$lib/state/session.svelte";
  import { uploadProfileImage, uploadBanner, updateAccount } from "$lib/data/index.js";
  import { cn } from "$lib/utils.js";
  import { setMode, userPrefersMode } from "mode-watcher";
  import { accents, setAccent, resetAccent, storedAccentName } from "$lib/state/accent.js";
  import {
    RiArrowLeftLine,
    RiImageEditLine,
    RiImageAddLine,
    RiCheckLine,
    RiHeart3Fill,
  } from "$lib/icons.js";

  const user = $derived(session.user);

  const modes = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ] as const;

  let activeAccent = $state("Violet");
  let themeMounted = $state(false);
  $effect(() => {
    themeMounted = true;
    activeAccent = storedAccentName();
  });

  function applyAccent(a: { name: string; color: string }) {
    activeAccent = a.name;
    setAccent(a.name);
  }
  function clearAccent() {
    activeAccent = "Violet";
    resetAccent();
  }

  let description = $state("");
  let descInit = false;
  $effect(() => {
    if (!descInit && user) {
      description = user.description ?? "";
      descInit = true;
    }
  });

  let pfpFile = $state<File | null>(null);
  let bannerFile = $state<File | null>(null);
  let pfpPreview = $state<string | null>(null);
  let bannerPreview = $state<string | null>(null);

  let cropOpen = $state(false);
  let cropType = $state<"pfp" | "banner">("pfp");
  let cropImage = $state<string | null>(null);
  let dragOver = $state(false);
  let fileInput = $state<HTMLInputElement>();

  let saving = $state(false);
  let justSaved = $state(false);
  let errorMsg = $state<string | null>(null);

  function openPicker(type: "pfp" | "banner") {
    cropType = type;
    cropImage = null;
    cropOpen = true;
  }

  function useFile(f: File | undefined | null) {
    if (f && f.type.startsWith("image/")) cropImage = URL.createObjectURL(f);
  }
  function onSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    useFile(input.files?.[0]);
    input.value = "";
  }
  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragOver = false;
    useFile(e.dataTransfer?.files?.[0]);
  }

  function onCropApply(file: File) {
    if (cropType === "pfp") {
      pfpFile = file;
      pfpPreview = URL.createObjectURL(file);
    } else {
      bannerFile = file;
      bannerPreview = URL.createObjectURL(file);
    }
    cropOpen = false;
    cropImage = null;
  }

  async function save() {
    const key = session.sessionKey;
    const id = user?.sonolus_id;
    if (!key || !id) {
      errorMsg = "You must be logged in.";
      return;
    }
    saving = true;
    errorMsg = null;
    let profile_hash: string | undefined;
    let banner_hash: string | undefined;
    if (pfpFile) {
      const h = await uploadProfileImage(key, id, pfpFile);
      if (h) profile_hash = h;
    }
    if (bannerFile) {
      const h = await uploadBanner(key, id, bannerFile);
      if (h) banner_hash = h;
    }
    const ok = await updateAccount(key, id, { description: description.trim(), profile_hash, banner_hash });
    saving = false;
    if (ok) {
      pfpFile = null;
      bannerFile = null;
      justSaved = true;
      session.init();
      setTimeout(() => (justSaved = false), 1800);
    } else {
      errorMsg = "Failed to save. Please try again.";
    }
  }

  const bannerSrc = $derived(bannerPreview ?? user?.banner ?? null);
  const pfpSrc = $derived(pfpPreview ?? user?.avatar ?? null);
  const dirty = $derived(!!pfpFile || !!bannerFile || (user ? description.trim() !== (user.description ?? "") : false));
</script>

<svelte:head>
  <title>Settings | UntitledCharts</title>
</svelte:head>

<main class="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
  <a
    href="/dashboard"
    class="text-muted-foreground hover:text-foreground group inline-flex items-center gap-1.5 text-sm transition-colors"
  >
    <RiArrowLeftLine
      class="size-4 transition-transform group-hover:-translate-x-0.5 motion-reduce:transition-none"
    />
    Dashboard
  </a>

  <header class="space-y-1">
    <h1 class="font-heading text-2xl font-bold tracking-tight">Settings</h1>
    <p class="text-muted-foreground text-sm">Manage your account and preferences.</p>
  </header>

  <!-- Account -->
  <section class="bg-card ring-border/70 rounded-2xl border ring-1">
    <!-- Banner -->
    <div class="relative overflow-hidden rounded-t-2xl">
      {#if bannerSrc}
        <div class="h-28 bg-cover bg-center sm:h-36" style={`background-image:url(${bannerSrc})`}></div>
      {:else}
        <div class="from-primary/25 to-card h-28 bg-linear-to-br sm:h-36"></div>
      {/if}
      <button
        type="button"
        onclick={() => openPicker("banner")}
        class="bg-background/70 hover:bg-background absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium shadow-sm backdrop-blur transition-colors"
      >
        <RiImageEditLine class="size-4" /> Change background
      </button>
    </div>

    <div class="px-5 pb-5">
      <!-- Only the avatar overlaps the banner; text sits below to avoid clashing with the image -->
      <div class="-mt-10 w-fit">
        <div class="relative">
          <CoverArt
            id={user?.username ?? "guest"}
            title={user?.username ?? "?"}
            src={pfpSrc}
            rounded="rounded-2xl"
            class="ring-card size-20 ring-4"
          />
          <button
            type="button"
            onclick={() => openPicker("pfp")}
            aria-label="Change profile picture"
            class="bg-primary text-primary-foreground absolute -right-1 -bottom-1 grid size-7 place-items-center rounded-full shadow-md transition-transform hover:scale-105"
          >
            <RiImageEditLine class="size-4" />
          </button>
        </div>
      </div>

      <div class="mt-3 min-w-0">
        <p class="font-heading truncate text-lg font-bold tracking-tight">{user?.username ?? ""}</p>
        <p class="text-muted-foreground text-sm">#{user?.handle ?? ""} · {user?.role ?? ""}</p>
      </div>

      <div class="mt-5 space-y-1.5">
        <span class="text-muted-foreground text-xs font-medium">Description</span>
        <EmojiTextarea
          bind:value={description}
          rows={4}
          maxlength={2000}
          placeholder="Tell people about your charts… type : for emojis"
          class="bg-card focus-visible:ring-ring/50 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus-visible:ring-2"
        />
        <span class="text-muted-foreground block text-right text-[11px] tabular-nums">{description.length}/2000</span>
      </div>

      <div class="mt-3 flex items-center justify-end gap-3">
        {#if errorMsg}
          <span class="text-sm font-medium text-rose-500">{errorMsg}</span>
        {/if}
        <Button
          onclick={save}
          disabled={saving || (!dirty && !justSaved)}
          class={cn(
            "rounded-full transition-colors",
            justSaved && "!border-emerald-500 !bg-emerald-500 !text-white",
          )}
        >
          {saving ? "Saving…" : justSaved ? "Saved!" : "Save changes"}
        </Button>
      </div>
    </div>
  </section>

  <section class="bg-card ring-border/70 space-y-3 rounded-2xl border p-5 ring-1">
    <div class="space-y-0.5">
      <h2 class="font-heading font-semibold">Appearance</h2>
      <p class="text-muted-foreground text-sm">Choose light, dark, or match your system.</p>
    </div>
    <div class="bg-muted/50 inline-flex items-center rounded-xl border p-1">
      {#each modes as m (m.value)}
        {@const active = themeMounted && userPrefersMode.current === m.value}
        <button
          type="button"
          onclick={() => setMode(m.value)}
          aria-pressed={active}
          class={cn(
            "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
            active
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {m.label}
        </button>
      {/each}
    </div>
  </section>

  <section class="bg-card ring-border/70 space-y-4 rounded-2xl border p-5 ring-1">
    <div class="space-y-0.5">
      <h2 class="font-heading font-semibold">Accent color</h2>
      <p class="text-muted-foreground text-sm">Recolor buttons, links and highlights across the app.</p>
    </div>

    <div class="flex flex-wrap items-center gap-3">
      {#each accents as a (a.name)}
        <button
          type="button"
          onclick={() => applyAccent(a)}
          aria-label={a.name}
          aria-pressed={activeAccent === a.name}
          class={cn(
            "ring-offset-card grid size-9 place-items-center rounded-full ring-2 ring-offset-2 transition-transform hover:scale-105",
            activeAccent === a.name ? "ring-foreground/60" : "ring-transparent",
          )}
          style="background-color: {a.color}"
        >
          {#if activeAccent === a.name}
            <RiCheckLine class="size-4 text-white" />
          {/if}
        </button>
      {/each}
      <button
        type="button"
        onclick={clearAccent}
        class="text-muted-foreground hover:text-foreground text-sm underline underline-offset-2"
      >
        Reset
      </button>
    </div>

    <div class="border-border/60 flex flex-wrap items-center gap-3 rounded-xl border border-dashed p-4">
      <Button size="sm" class="rounded-full">Primary button</Button>
      <DifficultyBadge difficulty="MASTER" level={32} />
      <span class="text-primary inline-flex items-center gap-1 text-sm font-medium">
        <RiHeart3Fill class="size-4" />
        Accent link
      </span>
    </div>

    <p class="text-muted-foreground text-xs">Accent changes apply live but reset on reload.</p>
  </section>

  <AuthorizedApps />
</main>

<!-- Upload + crop modal -->
<Modal bind:open={cropOpen}>
  <div class="p-1">
    <h2 class="font-heading mb-3 text-base font-semibold">
      {cropType === "pfp" ? "Profile picture" : "Background"}
    </h2>

    <input
      bind:this={fileInput}
      type="file"
      accept="image/png,image/jpeg,image/webp"
      onchange={onSelect}
      class="hidden"
    />

    {#if cropImage}
      <ImageCropper
        image={cropImage}
        aspect={cropType === "pfp" ? 1 : 3}
        round={false}
        onapply={onCropApply}
        oncancel={() => (cropOpen = false)}
      />
    {:else}
      <button
        type="button"
        onclick={() => fileInput?.click()}
        ondragover={(e) => {
          e.preventDefault();
          dragOver = true;
        }}
        ondragleave={() => (dragOver = false)}
        ondrop={onDrop}
        class={`flex min-h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-8 text-center transition-colors ${dragOver ? "border-primary bg-primary/5 text-primary" : "border-border text-muted-foreground hover:border-foreground/30"}`}
      >
        <RiImageAddLine class="size-9 opacity-70" />
        <span class="text-sm font-medium">Drop an image here, or click to select</span>
        <span class="text-xs opacity-70">
          {cropType === "pfp" ? "Square (1:1)" : "Wide (3:1)"} · PNG, JPEG or WebP
        </span>
      </button>
    {/if}
  </div>
</Modal>
