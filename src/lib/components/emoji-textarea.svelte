<script lang="ts">
  import { emojis, emojiSrc } from "$lib/data/index.js";
  import { cn } from "$lib/utils.js";

  let {
    value = $bindable(""),
    class: className,
    rows = 4,
    maxlength,
    placeholder,
  }: {
    value?: string;
    class?: string;
    rows?: number;
    maxlength?: number;
    placeholder?: string;
  } = $props();

  const names = Object.keys(emojis);

  let ta = $state<HTMLTextAreaElement>();
  let open = $state(false);
  let query = $state("");
  let start = $state(-1);
  let active = $state(0);

  const matches = $derived(
    open
      ? (query
          ? names.filter((n) => n.toLowerCase().includes(query.toLowerCase()))
          : names
        ).slice(0, 8)
      : [],
  );

  function update() {
    if (!ta) return;
    const caret = ta.selectionStart ?? value.length;
    const upto = value.slice(0, caret);
    const m = upto.match(/(?:^|\s)(:([a-zA-Z0-9_]*))$/);
    if (m) {
      start = caret - m[1].length;
      query = m[2];
      open = true;
      active = 0;
    } else {
      open = false;
    }
  }

  function choose(name: string) {
    if (start < 0 || !ta) return;
    const caret = ta.selectionStart ?? value.length;
    const before = value.slice(0, start);
    const after = value.slice(caret);
    const insert = `:${name}: `;
    value = before + insert + after;
    open = false;
    const pos = before.length + insert.length;
    requestAnimationFrame(() => {
      if (ta) {
        ta.focus();
        ta.setSelectionRange(pos, pos);
      }
    });
  }

  function onkeydown(e: KeyboardEvent) {
    if (!open || matches.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      active = (active + 1) % matches.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      active = (active - 1 + matches.length) % matches.length;
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      choose(matches[active]);
    } else if (e.key === "Escape") {
      open = false;
    }
  }
</script>

<div class="relative">
  <textarea
    bind:this={ta}
    bind:value
    {rows}
    {maxlength}
    {placeholder}
    oninput={update}
    onkeyup={update}
    onclick={update}
    onkeydown={onkeydown}
    onblur={() => setTimeout(() => (open = false), 150)}
    class={className}
  ></textarea>

  {#if open && matches.length}
    <ul
      class="bg-popover text-popover-foreground ring-foreground/10 absolute top-full left-0 z-[70] mt-1 max-h-56 w-64 max-w-full overflow-y-auto rounded-xl p-1 shadow-lg ring-1 backdrop-blur-2xl"
    >
      {#each matches as name, i (name)}
        <li>
          <button
            type="button"
            onpointerdown={(e) => {
              e.preventDefault();
              choose(name);
            }}
            class={cn(
              "hover:bg-accent flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-sm",
              i === active && "bg-accent",
            )}
          >
            <img src={emojiSrc(name)} alt="" class="size-5 shrink-0" />
            <span class="truncate">:{name}:</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
