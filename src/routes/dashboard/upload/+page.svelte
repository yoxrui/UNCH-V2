<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/button.svelte";
  import Select from "$lib/components/select.svelte";
  import EmojiTextarea from "$lib/components/emoji-textarea.svelte";
  import { session } from "$lib/state/session.svelte";
  import { uploadChart, type UploadData } from "$lib/data/index.js";
  import { RiArrowLeftLine, RiUpload2Line } from "$lib/icons.js";

  const user = $derived(session.user);

  type Visibility = "PUBLIC" | "UNLISTED" | "PRIVATE";
  const visibilityOptions: { value: Visibility; label: string }[] = [
    { value: "PUBLIC", label: "Public" },
    { value: "UNLISTED", label: "Unlisted" },
    { value: "PRIVATE", label: "Private" },
  ];

  let title = $state("");
  let artists = $state("");
  let author = $state("");
  let rating = $state("");
  let tags = $state("");
  let description = $state("");
  let visibility = $state<Visibility>("PUBLIC");

  let chartFile = $state<File | null>(null);
  let jacketFile = $state<File | null>(null);
  let audioFile = $state<File | null>(null);
  let previewFile = $state<File | null>(null);
  let backgroundFile = $state<File | null>(null);

  let submitting = $state(false);
  let error = $state<string | null>(null);

  $effect(() => {
    if (!author && user?.username) author = user.username;
  });

  function pick(e: Event): File | null {
    const target = e.target as HTMLInputElement;
    return target.files && target.files[0] ? target.files[0] : null;
  }

  const inputClass =
    "bg-card focus-visible:ring-ring/50 h-10 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2";
  const fileClass =
    "bg-card w-full cursor-pointer rounded-xl border px-3 py-2.5 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-semibold file:text-primary-foreground";

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    error = null;

    const key = session.sessionKey;
    if (!key) {
      error = "You need to be logged in to upload.";
      return;
    }
    if (!chartFile || !jacketFile || !audioFile) {
      error = "Chart file, cover image and music file are required.";
      return;
    }
    const r = parseInt(rating, 10);
    if (Number.isNaN(r)) {
      error = "Rating must be a number.";
      return;
    }

    submitting = true;
    const data: UploadData = {
      rating: r,
      title: title.trim(),
      artists: artists.trim(),
      author: author.trim(),
      description: description.trim(),
      includes_background: !!backgroundFile,
      includes_preview: !!previewFile,
      status: visibility,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };
    const res = await uploadChart(key, data, {
      chart_file: chartFile,
      jacket_image: jacketFile,
      audio_file: audioFile,
      preview_file: previewFile,
      background_image: backgroundFile,
    });
    submitting = false;

    if (res.ok) {
      goto(res.id ? `/levels/UnCh-${res.id}` : "/dashboard");
    } else {
      error = res.error;
    }
  }
</script>

<svelte:head>
  <title>Upload a Chart | UntitledCharts</title>
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
    <h1 class="font-heading inline-flex items-center gap-2 text-2xl font-bold tracking-tight">
      <RiUpload2Line class="text-primary size-6" />
      Upload a New Chart
    </h1>
    <p class="text-muted-foreground text-sm">
      Fill in the details and attach your chart, cover and audio files.
    </p>
  </header>

  {#if error}
    <div
      class="rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300"
    >
      {error}
    </div>
  {/if}

  <form onsubmit={submit} class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2">
      <label class="space-y-1">
        <span class="text-sm font-medium">Title <span class="text-rose-500">*</span></span>
        <input type="text" bind:value={title} required class={inputClass} placeholder="Chart title" />
      </label>
      <label class="space-y-1">
        <span class="text-sm font-medium">Artists <span class="text-rose-500">*</span></span>
        <input type="text" bind:value={artists} required class={inputClass} placeholder="Song artist(s)" />
      </label>
      <label class="space-y-1">
        <span class="text-sm font-medium">Charter <span class="text-rose-500">*</span></span>
        <input type="text" bind:value={author} required class={inputClass} placeholder="Chart designer name" />
      </label>
      <label class="space-y-1">
        <span class="text-sm font-medium">Rating <span class="text-rose-500">*</span></span>
        <input type="number" min="1" max="99" bind:value={rating} required class={inputClass} placeholder="e.g. 30" />
      </label>
      <label class="space-y-1">
        <span class="text-sm font-medium">Tags</span>
        <input type="text" bind:value={tags} class={inputClass} placeholder="Comma-separated" />
      </label>
      <div class="space-y-1">
        <span class="text-sm font-medium">Visibility</span>
        <Select bind:value={visibility} options={visibilityOptions} ariaLabel="Visibility" class="w-full" />
      </div>
    </div>

    <div class="space-y-1">
      <span class="text-sm font-medium">Description</span>
      <EmojiTextarea
        bind:value={description}
        rows={4}
        class="bg-card focus-visible:ring-ring/50 w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus-visible:ring-2"
        placeholder="BPM, note count, credits… type : for emojis"
      />
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      <label class="space-y-1">
        <span class="text-sm font-medium">Chart file <span class="text-rose-500">*</span></span>
        <input type="file" onchange={(e) => (chartFile = pick(e))} class={fileClass} />
      </label>
      <label class="space-y-1">
        <span class="text-sm font-medium">Cover image <span class="text-rose-500">*</span></span>
        <input type="file" accept="image/*" onchange={(e) => (jacketFile = pick(e))} class={fileClass} />
      </label>
      <label class="space-y-1">
        <span class="text-sm font-medium">Music file <span class="text-rose-500">*</span></span>
        <input type="file" accept="audio/*" onchange={(e) => (audioFile = pick(e))} class={fileClass} />
      </label>
      <label class="space-y-1">
        <span class="text-sm font-medium">Audio preview <span class="text-muted-foreground">(optional)</span></span>
        <input type="file" accept="audio/*" onchange={(e) => (previewFile = pick(e))} class={fileClass} />
      </label>
      <label class="space-y-1 sm:col-span-2">
        <span class="text-sm font-medium">Background image <span class="text-muted-foreground">(optional)</span></span>
        <input type="file" accept="image/*" onchange={(e) => (backgroundFile = pick(e))} class={fileClass} />
      </label>
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <Button href="/dashboard" variant="outline" type="button" class="rounded-full">Cancel</Button>
      <Button type="submit" disabled={submitting} class="rounded-full">
        <RiUpload2Line class="size-4" />
        {submitting ? "Uploading…" : "Upload chart"}
      </Button>
    </div>
  </form>
</main>
