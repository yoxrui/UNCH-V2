<script lang="ts">
  import { goto } from "$app/navigation";
  import Button from "$lib/components/button.svelte";
  import Select from "$lib/components/select.svelte";
  import EmojiTextarea from "$lib/components/emoji-textarea.svelte";
  import { session } from "$lib/state/session.svelte";
  import { editChart, type EditData, coverUrl, backgroundUrl } from "$lib/data/index.js";
  import { RiArrowLeftLine, RiEditLine, RiMusic2Line, RiFileMusicLine, RiFileList3Line } from "$lib/icons.js";

  let { data } = $props();

  // svelte-ignore state_referenced_locally
  const chart = data.chart;

  const user = $derived(session.user);
  const isOwner = $derived(!user || user.handle === chart.author_handle);

  type Visibility = "PUBLIC" | "UNLISTED" | "PRIVATE";
  const visibilityOptions: { value: Visibility; label: string }[] = [
    { value: "PUBLIC", label: "Public" },
    { value: "UNLISTED", label: "Unlisted" },
    { value: "PRIVATE", label: "Private" },
  ];

  let title = $state(chart.title);
  let artists = $state(chart.artists);
  let author = $state(chart.chart_design);
  let rating = $state(String(chart.rating));
  let tags = $state(chart.tags.join(", "));
  let description = $state(chart.description ?? "");
  let visibility = $state<Visibility>(chart.status);

  let chartFile = $state<File | null>(null);
  let jacketFile = $state<File | null>(null);
  let audioFile = $state<File | null>(null);
  let previewFile = $state<File | null>(null);
  let backgroundFile = $state<File | null>(null);
  let removePreview = $state(false);
  let removeBackground = $state(false);

  let submitting = $state(false);
  let error = $state<string | null>(null);

  function pick(e: Event): File | null {
    const target = e.target as HTMLInputElement;
    return target.files && target.files[0] ? target.files[0] : null;
  }

  const jacketPreview = $derived(jacketFile ? URL.createObjectURL(jacketFile) : null);
  const backgroundPreview = $derived(backgroundFile ? URL.createObjectURL(backgroundFile) : null);
  const currentBackground = $derived(backgroundUrl(chart));

  const inputClass =
    "bg-card focus-visible:ring-ring/50 h-10 w-full rounded-xl border px-3 text-sm outline-none focus-visible:ring-2";

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    error = null;

    const key = session.sessionKey;
    if (!key) {
      error = "You need to be logged in to edit.";
      return;
    }
    const r = parseInt(rating, 10);
    if (Number.isNaN(r)) {
      error = "Rating must be a number.";
      return;
    }

    submitting = true;
    const payload: EditData = {
      title: title.trim(),
      artists: artists.trim(),
      author: author.trim(),
      rating: r,
      description: description.trim(),
      status: visibility,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      includes_jacket: !!jacketFile,
      includes_audio: !!audioFile,
      includes_chart: !!chartFile,
      includes_preview: !!previewFile,
      includes_background: !!backgroundFile,
      delete_background: removeBackground,
      delete_preview: removePreview,
    };
    const res = await editChart(
      key,
      chart.id,
      payload,
      {
        chart_file: chartFile ?? undefined,
        jacket_image: jacketFile ?? undefined,
        audio_file: audioFile ?? undefined,
        preview_file: previewFile,
        background_image: backgroundFile,
      },
      visibility !== chart.status,
    );
    submitting = false;

    if (res.ok) {
      goto(`/levels/UnCh-${chart.id}`);
    } else {
      error = res.error;
    }
  }
</script>

<svelte:head>
  <title>Edit {chart.title} | UntitledCharts</title>
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
      <RiEditLine class="text-primary size-6" />
      Edit chart
    </h1>
    <p class="text-muted-foreground text-sm">Update details or replace files. Leave a file empty to keep the current one.</p>
  </header>

  {#if !isOwner}
    <div
      class="rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-300"
    >
      This isn't one of your charts, the server will reject changes.
    </div>
  {/if}

  {#if error}
    <div
      class="rounded-xl border border-rose-400/40 bg-rose-400/10 px-4 py-3 text-sm text-rose-600 dark:text-rose-300"
    >
      {error}
    </div>
  {/if}

  {#snippet fileField(o: {
    label: string;
    accept: string;
    onchange: (e: Event) => void;
    selected: File | null;
    thumb: string | null;
    icon: typeof RiMusic2Line;
    currentLabel: string;
  })}
    {@const Icon = o.icon}
    <div class="space-y-1.5">
      <span class="text-sm font-medium">{o.label}</span>
      <label
        class="bg-card hover:bg-accent/40 flex cursor-pointer items-center gap-3 rounded-xl border p-2.5 transition-colors"
      >
        <input type="file" accept={o.accept} onchange={o.onchange} class="hidden" />
        <div class="bg-muted grid size-12 shrink-0 place-items-center overflow-hidden rounded-lg">
          {#if o.thumb}
            <img src={o.thumb} alt="" class="size-full object-cover" />
          {:else}
            <Icon class="text-muted-foreground size-5" />
          {/if}
        </div>
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium">{o.selected ? o.selected.name : o.currentLabel}</p>
          <p class="text-muted-foreground truncate text-xs">
            {o.selected ? "New file selected" : "Click Replace to change"}
          </p>
        </div>
        <span
          class="bg-primary text-primary-foreground shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
          >Replace</span
        >
      </label>
    </div>
  {/snippet}

  <form onsubmit={submit} class="space-y-6">
    <div class="grid gap-4 sm:grid-cols-2">
      <label class="space-y-1">
        <span class="text-sm font-medium">Title</span>
        <input type="text" bind:value={title} required class={inputClass} />
      </label>
      <label class="space-y-1">
        <span class="text-sm font-medium">Artists</span>
        <input type="text" bind:value={artists} required class={inputClass} />
      </label>
      <label class="space-y-1">
        <span class="text-sm font-medium">Charter</span>
        <input type="text" bind:value={author} required class={inputClass} />
      </label>
      <label class="space-y-1">
        <span class="text-sm font-medium">Rating</span>
        <input type="number" min="1" max="99" bind:value={rating} required class={inputClass} />
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
        placeholder="Type : for emojis"
      />
    </div>

    <div class="grid gap-4 sm:grid-cols-2">
      {@render fileField({
        label: "Cover image",
        accept: "image/*",
        onchange: (e) => (jacketFile = pick(e)),
        selected: jacketFile,
        thumb: jacketPreview ?? coverUrl(chart),
        icon: RiFileList3Line,
        currentLabel: "Current cover",
      })}
      {@render fileField({
        label: "Background image",
        accept: "image/*",
        onchange: (e) => (backgroundFile = pick(e)),
        selected: backgroundFile,
        thumb: backgroundPreview ?? currentBackground,
        icon: RiFileList3Line,
        currentLabel: currentBackground ? "Current background" : "No background set",
      })}
      {@render fileField({
        label: "Chart file",
        accept: "",
        onchange: (e) => (chartFile = pick(e)),
        selected: chartFile,
        thumb: null,
        icon: RiFileList3Line,
        currentLabel: "Current chart file",
      })}
      {@render fileField({
        label: "Music file",
        accept: "audio/*",
        onchange: (e) => (audioFile = pick(e)),
        selected: audioFile,
        thumb: null,
        icon: RiFileMusicLine,
        currentLabel: "Current music file",
      })}
      {@render fileField({
        label: "Audio preview",
        accept: "audio/*",
        onchange: (e) => (previewFile = pick(e)),
        selected: previewFile,
        thumb: null,
        icon: RiMusic2Line,
        currentLabel: "Current audio preview",
      })}
    </div>

    <div class="flex flex-wrap gap-x-6 gap-y-2">
      <label class="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" bind:checked={removePreview} class="checkbox checkbox-sm" />
        Remove audio preview
      </label>
      <label class="inline-flex items-center gap-2 text-sm">
        <input type="checkbox" bind:checked={removeBackground} class="checkbox checkbox-sm" />
        Remove background image
      </label>
    </div>

    <div class="flex justify-end gap-3 pt-2">
      <Button href={`/levels/UnCh-${chart.id}`} variant="outline" type="button" class="rounded-full">
        Cancel
      </Button>
      <Button type="submit" disabled={submitting} class="rounded-full">
        <RiEditLine class="size-4" />
        {submitting ? "Saving…" : "Save changes"}
      </Button>
    </div>
  </form>
</main>
