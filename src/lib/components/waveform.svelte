<script lang="ts" module>
  let currentWave: { stop: () => void } | null = null;
  const peakCache = new Map<string, { peaks: number[][]; duration: number }>();
</script>

<script lang="ts">
  import { onMount } from "svelte";
  import { cn } from "$lib/utils.js";
  import { RiPlayFill, RiPauseFill } from "$lib/icons.js";
  import type { WaveSurferOptions } from "wavesurfer.js";

  let {
    id,
    src = null,
    variant = "full",
    height,
    class: className,
  }: {
    id: string;
    src?: string | null;
    variant?: "full" | "compact";
    height?: number;
    class?: string;
  } = $props();

  let container = $state<HTMLDivElement | null>(null);
  let playing = $state(false);
  let ready = $state(false);

  type WS = import("wavesurfer.js").default;
  let ws: WS | null = null;
  let token = 0;

  function cssVar(el: Element, name: string) {
    return getComputedStyle(el).getPropertyValue(name).trim();
  }

  const api = {
    stop: () => ws?.pause(),
  };

  async function create() {
    if (!container || !src) return;
    const el = container;
    const mine = ++token;
    const { default: WaveSurfer } = await import("wavesurfer.js");
    if (mine !== token || !el.isConnected) return;

    ws?.destroy();
    ready = false;
    playing = false;

    const muted = cssVar(el, "--muted-foreground") || "#888";
    const primary = cssVar(el, "--primary") || "#6366f1";

    const opts: WaveSurferOptions = {
      container: el,
      height: height ?? (variant === "compact" ? 36 : 72),
      barWidth: variant === "compact" ? 2 : 3,
      barGap: variant === "compact" ? 3 : 5,
      barRadius: 8,
      barHeight: 0.7,
      normalize: false,
      cursorWidth: 1,
      waveColor: muted,
      progressColor: primary,
      interact: true,
      url: src,
    };

    const cached = peakCache.get(src);
    if (cached) {
      opts.peaks = cached.peaks;
      opts.duration = cached.duration;
    }

    ws = WaveSurfer.create(opts);
    ws.on("ready", () => {
      ready = true;
      if (src && ws && !peakCache.has(src)) {
        peakCache.set(src, { peaks: ws.exportPeaks(), duration: ws.getDuration() });
      }
    });
    ws.on("play", () => {
      playing = true;
      if (currentWave && currentWave !== api) currentWave.stop();
      currentWave = api;
    });
    ws.on("pause", () => (playing = false));
    ws.on("finish", () => (playing = false));
  }

  function toggle() {
    if (!src) return;
    ws?.playPause();
  }

  onMount(() => {
    create();

    const obs = new MutationObserver(() => create());
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      token++;
      obs.disconnect();
      ws?.destroy();
      ws = null;
      if (currentWave === api) currentWave = null;
    };
  });
</script>

<div class={cn("flex items-center gap-3", className)}>
  <button
    type="button"
    onclick={toggle}
    disabled={!src || !ready}
    aria-label={playing ? "Pause" : "Play"}
    aria-pressed={playing}
    class={cn(
      "grid shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform active:scale-90 disabled:opacity-50 motion-reduce:active:scale-100",
      variant === "compact" ? "size-7" : "size-9",
    )}
  >
    {#if playing}
      <RiPauseFill class={variant === "compact" ? "size-3.5" : "size-4"} />
    {:else}
      <RiPlayFill class={cn(variant === "compact" ? "size-3.5" : "size-4", "translate-x-px")} />
    {/if}
  </button>

  <div bind:this={container} class="min-w-0 flex-1"></div>
</div>
