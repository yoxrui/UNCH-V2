<script lang="ts">
  import { onMount, untrack } from "svelte";
  import { Tween } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import { getPeaks } from "$lib/data/index.js";
  import { cn } from "$lib/utils.js";
  import { RiPlayFill, RiPauseFill } from "remixicon-svelte";
  import type { WaveSurferOptions } from "wavesurfer.js";

  let {
    id,
    variant = "full",
    height,
    class: className,
  }: {
    id: string;
    variant?: "full" | "compact";
    height?: number;
    class?: string;
  } = $props();

  // The demo has no audio, so this is a *visual* preview: wavesurfer.js draws
  // the (seeded, deterministic) waveform and we sweep a playhead across it with
  // svelte/motion. There is intentionally no sound.
  const PREVIEW_MS = 9000;
  const peaks = $derived(getPeaks(id, variant === "compact" ? 64 : 120));

  let container = $state<HTMLDivElement | null>(null);
  let playing = $state(false);
  let reduced = $state(false);
  const progress = new Tween(0, { duration: 120, easing: cubicOut });

  type WS = import("wavesurfer.js").default;
  let ws: WS | null = null;
  let token = 0; // guards against races when recreating on theme change

  function cssVar(el: Element, name: string) {
    return getComputedStyle(el).getPropertyValue(name).trim();
  }

  async function create() {
    if (!container) return;
    const el = container;
    const mine = ++token;
    const { default: WaveSurfer } = await import("wavesurfer.js");
    if (mine !== token || !el.isConnected) return;

    ws?.destroy();
    const opts: WaveSurferOptions = {
      container: el,
      peaks: [peaks],
      duration: 1, // arbitrary; we own the playhead
      height: height ?? (variant === "compact" ? 36 : 72),
      barWidth: variant === "compact" ? 2 : 3,
      barGap: variant === "compact" ? 1.5 : 2,
      barRadius: 8,
      cursorWidth: 0, // our own cursor overlay instead
      waveColor: cssVar(el, "--muted-foreground") || "#888",
      progressColor: cssVar(el, "--muted-foreground") || "#888",
      interact: false,
    };
    ws = WaveSurfer.create(opts);
  }

  function seek(e: MouseEvent) {
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    progress.set(ratio, { duration: 0 });
    if (playing) play();
  }

  function play() {
    if (reduced) {
      progress.set(1, { duration: 0 });
      return;
    }
    playing = true;
    if (progress.current >= 0.999) progress.set(0, { duration: 0 });
    const remaining = PREVIEW_MS * (1 - progress.current);
    progress.set(1, { duration: remaining, easing: (t) => t }).then(() => {
      if (untrack(() => playing) && progress.current >= 0.999) {
        playing = false;
        progress.set(0, { duration: 400, easing: cubicOut });
      }
    });
  }

  function pause() {
    playing = false;
    progress.set(progress.current, { duration: 0 });
  }

  function toggle() {
    playing ? pause() : play();
  }

  onMount(() => {
    reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    create();

    // Re-render with theme-matched colors when light/dark toggles.
    const obs = new MutationObserver(() => create());
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    return () => {
      token++;
      obs.disconnect();
      ws?.destroy();
      ws = null;
    };
  });
</script>

<div class={cn("flex items-center gap-3", className)}>
  <button
    type="button"
    onclick={toggle}
    aria-label={playing ? "Pause preview" : "Play preview"}
    aria-pressed={playing}
    class={cn(
      "grid shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform active:scale-90 motion-reduce:active:scale-100",
      variant === "compact" ? "size-7" : "size-9",
    )}
  >
    {#if playing}
      <RiPauseFill class={variant === "compact" ? "size-3.5" : "size-4"} />
    {:else}
      <RiPlayFill class={cn(variant === "compact" ? "size-3.5" : "size-4", "translate-x-px")} />
    {/if}
  </button>

  <!-- waveform + playhead overlay -->
  <div
    class="relative min-w-0 flex-1 cursor-pointer"
    role="slider"
    aria-label="Seek preview"
    aria-valuemin={0}
    aria-valuemax={100}
    aria-valuenow={Math.round(progress.current * 100)}
    tabindex="0"
    onclick={seek}
    onkeydown={(e) => {
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        toggle();
      }
    }}
  >
    <div bind:this={container} class="w-full"></div>
    <!-- played region tint -->
    <div
      class="pointer-events-none absolute inset-y-0 left-0 rounded-l bg-primary/15"
      style="width: {progress.current * 100}%"
    ></div>
    <!-- cursor -->
    <div
      class="bg-primary pointer-events-none absolute inset-y-0 w-0.5 rounded-full"
      style="left: {progress.current * 100}%; opacity: {progress.current > 0 || playing ? 1 : 0}"
    ></div>
  </div>
</div>
