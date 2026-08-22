<script lang="ts" generics="T extends string">
  import { cn } from "$lib/utils.js";
  import { RiArrowDownSLine, RiCheckLine } from "$lib/icons.js";

  type Option = { value: T; label: string };

  let {
    value = $bindable(),
    options,
    label,
    ariaLabel,
    class: className,
  }: {
    value: T;
    options: readonly Option[];
    label?: string;
    ariaLabel?: string;
    class?: string;
  } = $props();

  let open = $state(false);
  let root = $state<HTMLDetailsElement>();

  const selectedLabel = $derived(options.find((o) => o.value === value)?.label ?? "");

  function choose(v: T) {
    value = v;
    open = false;
  }

  // Close on outside click / Escape (native <details> only toggles from the summary).
  $effect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (root && !root.contains(e.target as Node)) open = false;
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") open = false;
    }
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown);
    };
  });
</script>

<<<<<<< HEAD
<details bind:this={root} bind:open class={cn("dropdown", className)}>
  <summary
    aria-label={ariaLabel}
    class="bg-card focus-visible:ring-ring/50 flex h-10 w-full cursor-pointer list-none items-center justify-between gap-1.5 rounded-xl border px-3 text-sm outline-none select-none focus-visible:ring-2 [&::-webkit-details-marker]:hidden"
=======
<details bind:this={root} bind:open class="dropdown">
  <summary
    aria-label={ariaLabel}
    class={cn(
      "bg-card focus-visible:ring-ring/50 inline-flex h-10 cursor-pointer list-none items-center justify-between gap-1.5 rounded-xl border px-3 text-sm outline-none select-none focus-visible:ring-2 [&::-webkit-details-marker]:hidden",
      className,
    )}
>>>>>>> 44d77f6faedd3aa3bbfc5a9d7327334914351f3e
  >
    <span class="flex min-w-0 items-center gap-1.5 truncate">
      {#if label}<span class="text-muted-foreground text-xs">{label}</span>{/if}
      {selectedLabel}
    </span>
    <RiArrowDownSLine
      class={cn(
        "text-muted-foreground size-4 shrink-0 transition-transform",
        open && "rotate-180",
      )}
    />
  </summary>

  <ul
    role="listbox"
    class="bg-popover/80 dropdown-content menu ring-foreground/10 z-50 mt-1 max-h-64 w-full min-w-40 flex-nowrap overflow-y-auto rounded-lg p-1 shadow-md ring-1 backdrop-blur-2xl backdrop-saturate-150"
  >
    {#each options as o (o.value)}
      {@const active = o.value === value}
      <li>
        <button
          type="button"
          role="option"
          aria-selected={active}
          onclick={() => choose(o.value)}
          class={cn(
            "justify-between gap-2",
            active && "bg-accent text-accent-foreground font-medium",
          )}
        >
          {o.label}
          {#if active}<RiCheckLine class="size-4 shrink-0" />{/if}
        </button>
      </li>
    {/each}
  </ul>
</details>
