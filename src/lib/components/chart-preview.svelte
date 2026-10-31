<script lang="ts">
  import { t } from "$lib/i18n.svelte.js";
  import { onMount } from "svelte";
  import { cn } from "$lib/utils.js";
  import { createPreviewRenderer, type PreviewRenderer } from "$lib/chart-preview/preview/gl";
  import { renderPreviewFrame } from "$lib/chart-preview/preview/engine/render";
  import { buildPreviewChart } from "$lib/chart-preview/preview/engine/chart";
  import { TARGET_ASPECT_RATIO } from "$lib/chart-preview/preview/engine/layout";
  import { loadSkinFromServer, type LoadedSkin } from "$lib/chart-preview/preview/skin";
  import { loadParticleFromServer, type LoadedParticle } from "$lib/chart-preview/preview/particle";
  import { loadPreviewState, firstItemName } from "$lib/chart-preview/load";
  import type { State } from "$lib/chart-preview/state";
  import {
    RiPlayFill,
    RiPauseFill,
    RiRestartLine,
    RiVolumeUpLine,
    RiVolumeMuteLine,
    RiFullscreenLine,
    RiFullscreenExitLine,
    RiSubtractLine,
    RiAddLine,
    RiErrorWarningLine,
    RiSettings3Line,
  } from "$lib/icons.js";

  let {
    chartUrl,
    audioUrl,
    bgUrl = null,
    server = "https://untitledcharts.com",
  }: { chartUrl: string; audioUrl: string; bgUrl?: string | null; server?: string } = $props();

  let stage = $state<HTMLDivElement>();
  let container = $state<HTMLDivElement>();
  let canvas = $state<HTMLCanvasElement>();
  let audio = $state<HTMLAudioElement>();
  let renderer: PreviewRenderer | undefined;

  let skin = $state<LoadedSkin>();
  let particle = $state<LoadedParticle>();
  let chartState = $state<State>();
  let status = $state<"loading" | "error" | "ready">("loading");
  let step = $state("preview.loadingSkin");

  let playing = $state(false);
  let cursorTime = $state(0);
  let audioDuration = $state(0);
  let isFullscreen = $state(false);
  let settingsOpen = $state(false);

  const DEFAULTS = {
    noteSpeed: 11,
    quality: 1,
    showEffects: true,
    musicVolume: 0.8,
  };
  let noteSpeed = $state(DEFAULTS.noteSpeed);
  let quality = $state(DEFAULTS.quality);
  let showEffects = $state(DEFAULTS.showEffects);
  let muted = $state(false);
  let musicVolume = $state(DEFAULTS.musicVolume);
  let settingsLoaded = false;

  const QUALITY = [
    { get label() { return t("preview.qualityLow"); }, value: 0.5 },
    { get label() { return t("preview.qualityMed"); }, value: 0.75 },
    { get label() { return t("preview.qualityHigh"); }, value: 1 },
    { get label() { return t("preview.qualityMax"); }, value: 1.5 },
  ];

  const offset = $derived(chartState?.bgm.offset ?? 0);
  const previewChart = $derived(chartState ? buildPreviewChart(chartState, noteSpeed) : undefined);
  const chartDuration = $derived(
    previewChart ? previewChart.notes.reduce((m, n) => Math.max(m, n.targetTime), 0) + 2 : 0,
  );
  const duration = $derived(audioDuration > 0 ? audioDuration - offset : chartDuration);

  let cw = $state(0),
    ch = $state(0),
    cl = $state(0),
    ct = $state(0);
  let containerW = 0,
    containerH = 0;
  let dirty = $state(true);

  function updateCanvasSize() {
    if (!containerW || !containerH) return;
    const width = Math.min(containerW, containerH * TARGET_ASPECT_RATIO);
    const height = width / TARGET_ASPECT_RATIO;
    const pr = Math.min(2, devicePixelRatio || 1);
    cw = Math.round(width * pr) / pr;
    ch = Math.round(height * pr) / pr;
    cl = Math.round(((containerW - cw) / 2) * pr) / pr;
    ct = Math.round(((containerH - ch) / 2) * pr) / pr;
    dirty = true;
  }

  function getRenderSize(scale: number) {
    if (!renderer) return;
    const rw = cw * scale,
      rh = ch * scale;
    const { width: mw, height: mh } = renderer.maxViewportSize;
    const fit = Math.min(1, mw / rw, mh / rh);
    return { width: Math.max(1, Math.round(rw * fit)), height: Math.max(1, Math.round(rh * fit)) };
  }

  $effect(() => {
    noteSpeed;
    quality;
    showEffects;
    skin;
    particle;
    dirty = true;
  });

  $effect(() => {
    if (audio) {
      audio.volume = musicVolume;
      audio.muted = muted;
    }
  });

  $effect(() => {
    const snapshot = { noteSpeed, quality, showEffects, musicVolume };
    if (!settingsLoaded) return;
    try {
      localStorage.setItem("unch:preview-settings-v2", JSON.stringify(snapshot));
    } catch {
      void 0;
    }
  });

  let raf = 0;
  function frame() {
    raf = requestAnimationFrame(frame);
    if (audio && playing) {
      cursorTime = audio.currentTime - offset;
    }
    if (!renderer || !skin || !previewChart || !cw || !ch) return;
    if (!playing && !dirty) return;
    const rs = getRenderSize(Math.min(2, devicePixelRatio || 1) * quality);
    if (!rs) return;
    renderPreviewFrame(
      renderer,
      skin.skin,
      previewChart,
      cursorTime,
      rs.width,
      rs.height,
      cw,
      ch,
      noteSpeed,
      showEffects,
      particle?.particle,
    );
    dirty = false;
  }

  async function init() {
    status = "loading";
    try {
      step = "preview.loadingSkin";
      const [skinName, particleName] = await Promise.all([
        firstItemName(server, "skins"),
        firstItemName(server, "particles"),
      ]);
      if (skinName) skin = await loadSkinFromServer(server, skinName);
      if (particleName)
        particle = await loadParticleFromServer(server, particleName).catch(() => undefined);
      step = "preview.loadingChart";
      chartState = await loadPreviewState(chartUrl);
      status = skin ? "ready" : "error";
    } catch (e) {
      console.error("Chart preview failed:", e);
      status = "error";
    }
  }

  $effect(() => {
    if (!canvas || !skin) return;
    if (!renderer || renderer.isContextLost()) {
      try {
        renderer = createPreviewRenderer(canvas, true);
      } catch (e) {
        console.error("Renderer init failed:", e);
        status = "error";
        return;
      }
    }
    renderer.setTexture(0, skin.texture, skin.interpolation);
    if (particle) renderer.setTexture(1, particle.texture, particle.interpolation);
    dirty = true;
  });

  onMount(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("unch:preview-settings-v2") ?? "null");
      if (saved) {
        noteSpeed = saved.noteSpeed ?? noteSpeed;
        quality = saved.quality ?? quality;
        showEffects = saved.showEffects ?? showEffects;
        musicVolume = saved.musicVolume ?? musicVolume;
      }
    } catch {
      void 0;
    }
    settingsLoaded = true;

    const ro = new ResizeObserver(([entry]) => {
      if (!entry) return;
      containerW = entry.contentRect.width;
      containerH = entry.contentRect.height;
      updateCanvasSize();
    });
    if (container) ro.observe(container);

    const onFs = () => (isFullscreen = document.fullscreenElement === stage);
    document.addEventListener("fullscreenchange", onFs);

    void init();
    raf = requestAnimationFrame(frame);
    return () => {
      ro.disconnect();
      document.removeEventListener("fullscreenchange", onFs);
      cancelAnimationFrame(raf);
      renderer?.dispose();
    };
  });

  function onPlay() {
    playing = true;
  }
  function onPause() {
    playing = false;
  }
  function toggle() {
    if (!audio || status !== "ready") return;
    if (audio.paused) void audio.play();
    else audio.pause();
  }
  function restart() {
    if (!audio) return;
    audio.currentTime = Math.max(0, offset);
    cursorTime = 0;
    dirty = true;
    void audio.play();
  }
  function seek(e: Event) {
    const v = Number.parseFloat((e.target as HTMLInputElement).value);
    cursorTime = v;
    if (audio) audio.currentTime = Math.max(0, v + offset);
    dirty = true;
  }
  function nudgeSpeed(delta: number) {
    noteSpeed = Math.min(12, Math.max(1, Math.round((noteSpeed + delta) * 2) / 2));
  }
  function resetSettings() {
    noteSpeed = DEFAULTS.noteSpeed;
    quality = DEFAULTS.quality;
    showEffects = DEFAULTS.showEffects;
    musicVolume = DEFAULTS.musicVolume;
  }
  function toggleFullscreen() {
    if (!stage) return;
    if (document.fullscreenElement) void document.exitFullscreen();
    else void stage.requestFullscreen();
  }
  function onKey(e: KeyboardEvent) {
    if (e.key === "Escape" && settingsOpen) {
      settingsOpen = false;
      return;
    }
    if (e.key === " " || e.key === "k") {
      e.preventDefault();
      toggle();
    }
  }
  function fmt(s: number) {
    const t = Math.max(0, s);
    const m = Math.floor(t / 60);
    const sec = Math.floor(t % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }
</script>

<audio
  bind:this={audio}
  src={audioUrl}
  preload="auto"
  onplay={onPlay}
  onpause={onPause}
  onended={onPause}
  onloadedmetadata={() => (audioDuration = audio?.duration ?? 0)}
></audio>

{#snippet settingsBody(dark: boolean)}
    <div class="flex items-center justify-between">
      <h3 class="font-heading text-sm font-semibold">{t("settings.title")}</h3>
      <button type="button" onclick={resetSettings} class={cn("text-xs", dark ? "text-white/60 hover:text-white" : "text-muted-foreground hover:text-foreground")}>
        {t("settings.reset")}
      </button>
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-sm">{t("preview.scrollSpeed")}</span>
        <div class={cn("flex items-center rounded-lg", dark ? "bg-white/10" : "bg-background border")}>
          <button
            type="button"
            onclick={() => nudgeSpeed(-0.5)}
            aria-label={t("preview.slower")}
            class={cn("grid size-7 place-items-center", dark ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground")}
          >
            <RiSubtractLine class="block size-3.5" />
          </button>
          <span class="w-9 text-center text-sm font-semibold tabular-nums">{noteSpeed.toFixed(1)}</span>
          <button
            type="button"
            onclick={() => nudgeSpeed(0.5)}
            aria-label={t("preview.faster")}
            class={cn("grid size-7 place-items-center", dark ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground")}
          >
            <RiAddLine class="block size-3.5" />
          </button>
        </div>
      </div>
      <input
        type="range"
        min="1"
        max="12"
        step="0.5"
        bind:value={noteSpeed}
        aria-label={t("preview.scrollSpeed")}
        class="range range-primary range-xs w-full"
      />
    </div>

    <div class="space-y-2">
      <span class="text-sm">{t("preview.quality")}</span>
      <div class={cn("grid grid-cols-4 gap-1 rounded-xl p-1", dark ? "bg-white/10" : "bg-muted")} role="radiogroup" aria-label={t("preview.quality")}>
        {#each QUALITY as q (q.value)}
          <button
            type="button"
            role="radio"
            aria-checked={quality === q.value}
            onclick={() => (quality = q.value)}
            class={cn(
              "rounded-lg py-1 text-xs font-medium transition-colors",
              quality === q.value
                  ? dark ? "bg-white text-slate-900" : "bg-background text-foreground shadow-sm"
                  : dark ? "text-white/70 hover:text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {q.label}
          </button>
        {/each}
      </div>
    </div>

    <label class="flex cursor-pointer items-center justify-between gap-3">
      <span class="text-sm">{t("preview.hitEffects")}</span>
      <input type="checkbox" bind:checked={showEffects} class="toggle toggle-primary toggle-sm" />
    </label>

    <div class="space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-sm">{t("preview.music")}</span>
        <span class={cn("text-xs tabular-nums", dark ? "text-white/60" : "text-muted-foreground")}>{Math.round(musicVolume * 100)}%</span>
      </div>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        bind:value={musicVolume}
        aria-label={t("preview.musicVolume")}
        class="range range-primary range-xs w-full"
      />
    </div>
{/snippet}

<!-- svelte-ignore a11y_no_noninteractive_tabindex, a11y_no_noninteractive_element_interactions -->
<div
  bind:this={stage}
  tabindex="0"
  role="region"
  aria-label={t("preview.chartPreview")}
  onkeydown={onKey}
  class={cn(
    "focus-visible:ring-ring/60 relative aspect-video w-full overflow-hidden border bg-slate-950 outline-none focus-visible:ring-2",
    isFullscreen ? "rounded-none border-0" : "rounded-3xl",
  )}
>
  {#if bgUrl}
    <div class="absolute inset-0 bg-cover bg-center" style={`background-image:url(${bgUrl})`}></div>
    <div class="absolute inset-0 bg-slate-950/55"></div>
  {/if}

  <div bind:this={container} class="absolute inset-0">
    <div
      class="absolute overflow-hidden"
      style={`left:${cl}px;top:${ct}px;width:${cw}px;height:${ch}px`}
    >
      <canvas bind:this={canvas} class="absolute inset-0 h-full w-full"></canvas>
    </div>
  </div>

  <div class="pointer-events-none absolute inset-x-0 top-0 z-10 bg-linear-to-b from-slate-950/70 to-transparent px-4 pt-3 pb-8">
    <h2 class="font-heading text-sm font-semibold text-white">{t("preview.preview")}</h2>
  </div>

  {#if status === "loading"}
    <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/60 text-white backdrop-blur-sm">
      <span class="loading loading-spinner loading-lg text-white"></span>
      <p class="text-sm font-medium">{t(step)}</p>
    </div>
  {:else if status === "error"}
    <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950/70 px-6 text-center text-white">
      <RiErrorWarningLine class="block size-8 text-rose-300" />
      <p class="text-sm">{t("preview.thisChartSPreviewCouldn")}</p>
      <button
        type="button"
        onclick={init}
        class="rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold ring-1 ring-white/20 hover:bg-white/25"
      >
        {t("preview.tryAgain")}
      </button>
    </div>
  {:else}
    {#if !playing && !settingsOpen}
      <button
        type="button"
        onclick={toggle}
        aria-label={t("preview.playPreview")}
        class="absolute inset-0 grid place-items-center bg-slate-950/20 transition-colors hover:bg-slate-950/35"
      >
        <span class="bg-primary text-primary-foreground grid size-16 place-items-center rounded-full shadow-xl ring-4 ring-white/15">
          <RiPlayFill class="block size-7" />
        </span>
      </button>
    {/if}

    {#if settingsOpen}
      <button
        type="button"
        aria-label={t("preview.closeSettings")}
        onclick={() => (settingsOpen = false)}
        class="absolute inset-0 cursor-default"
      ></button>
      <div
        role="dialog"
        aria-label={t("preview.previewSettings")}
        class="absolute right-3 bottom-16 z-20 w-64 max-w-[calc(100%-1.5rem)] space-y-4 rounded-2xl bg-slate-900/95 p-4 text-white shadow-2xl ring-1 ring-white/10 backdrop-blur"
      >
        {@render settingsBody(true)}
      </div>
    {/if}

    <div class="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-linear-to-t from-slate-950/90 to-transparent px-2.5 pt-8 pb-2 text-white sm:gap-2">
      <button
        type="button"
        onclick={toggle}
        aria-label={playing ? t("preview.pause") : t("preview.play")}
        class="grid size-9 shrink-0 place-items-center rounded-full hover:bg-white/15"
      >
        {#if playing}
          <RiPauseFill class="block size-5" />
        {:else}
          <RiPlayFill class="block size-5" />
        {/if}
      </button>
      <button
        type="button"
        onclick={restart}
        aria-label={t("preview.restart")}
        class="grid size-9 shrink-0 place-items-center rounded-full hover:bg-white/15"
      >
        <RiRestartLine class="block size-4.5" />
      </button>
      <span class="shrink-0 text-xs text-white/85 tabular-nums">{fmt(cursorTime)}</span>
      <input
        type="range"
        min="0"
        max={duration || 1}
        step="0.01"
        value={cursorTime}
        oninput={seek}
        aria-label={t("preview.seek")}
        class="range range-primary range-xs mx-1 min-w-0 flex-1"
      />
      <span class="shrink-0 text-xs text-white/60 tabular-nums">{fmt(duration)}</span>
      <button
        type="button"
        onclick={() => (muted = !muted)}
        aria-label={muted ? t("preview.unmute") : t("preview.mute")}
        aria-pressed={muted}
        class="grid size-9 shrink-0 place-items-center rounded-full hover:bg-white/15"
      >
        {#if muted}
          <RiVolumeMuteLine class="block size-4.5" />
        {:else}
          <RiVolumeUpLine class="block size-4.5" />
        {/if}
      </button>
      <button
        type="button"
        onclick={() => (settingsOpen = !settingsOpen)}
        aria-label={t("settings.title")}
        aria-expanded={settingsOpen}
        class={cn(
          "grid size-9 shrink-0 place-items-center rounded-full hover:bg-white/15",
          settingsOpen && "bg-white/15",
        )}
      >
        <RiSettings3Line class={cn("block size-4.5 transition-transform", settingsOpen && "rotate-45")} />
      </button>
      <button
        type="button"
        onclick={toggleFullscreen}
        aria-label={isFullscreen ? t("preview.exitFullscreen") : t("preview.fullscreen")}
        class="grid size-9 shrink-0 place-items-center rounded-full hover:bg-white/15"
      >
        {#if isFullscreen}
          <RiFullscreenExitLine class="block size-4.5" />
        {:else}
          <RiFullscreenLine class="block size-4.5" />
        {/if}
      </button>
    </div>
  {/if}
</div>
