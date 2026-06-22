<script lang="ts">
  import type { ScoreEntry, LeaderboardType } from "$lib/data/index.js";
  import { grouped, gradeBadge, leaderboardMeta } from "$lib/data/index.js";
  import { cn } from "$lib/utils.js";

  let {
    entries,
    type,
    startRank = 1,
  }: { entries: ScoreEntry[]; type: LeaderboardType; startRank?: number } = $props();

  const primaryLabel = $derived(
    type === "accuracy_score"
      ? "Accuracy"
      : type === "least_combo_breaks"
        ? "Breaks"
        : type === "least_misses"
          ? "Misses"
          : type === "perfect"
            ? "Perfect"
            : "Score",
  );

  function primary(e: ScoreEntry): string {
    switch (type) {
      case "accuracy_score":
        return grouped(e.accuracy_score);
      case "least_combo_breaks":
        return `${e.ngood + e.nmiss}`;
      case "least_misses":
        return `${e.nmiss}`;
      case "perfect":
        return grouped(e.nperfect);
      default:
        return grouped(e.arcade_score);
    }
  }

  function rankClass(rank: number): string {
    if (rank === 1) return "bg-amber-400/20 text-amber-600 ring-amber-400/40 dark:text-amber-300";
    if (rank === 2) return "bg-slate-400/20 text-slate-600 ring-slate-400/40 dark:text-slate-200";
    if (rank === 3) return "bg-orange-500/15 text-orange-600 ring-orange-500/40 dark:text-orange-300";
    return "text-muted-foreground ring-border";
  }
</script>

<div class="space-y-1.5" aria-label={`${leaderboardMeta[type].label} leaderboard`}>
  <div
    class="text-muted-foreground hidden items-center gap-3 px-3 text-[11px] font-medium tracking-wide uppercase sm:flex"
  >
    <span class="w-8 text-center">#</span>
    <span class="flex-1">Player</span>
    <span class="w-40">Judgments</span>
    <span class="w-12 text-center">Spd</span>
    <span class="w-24 text-right">{primaryLabel}</span>
  </div>

  {#each entries as e, i (e.id)}
    {@const rank = startRank + i}
    {@const grade = gradeBadge(e.grade)}
    <div
      class="bg-card/60 ring-border/50 hover:bg-card flex items-center gap-3 rounded-xl px-3 py-2.5 ring-1 transition-colors"
    >
      <span
        class={cn(
          "grid size-8 shrink-0 place-items-center rounded-full text-xs font-bold tabular-nums ring-1",
          rankClass(rank),
        )}
      >
        {rank}
      </span>

      <div class="flex min-w-0 flex-1 flex-col">
        <span class="flex items-center gap-1.5">
          <span class="truncate text-sm font-semibold">{e.account.sonolus_username}</span>
          <span class="text-muted-foreground/70 text-xs tabular-nums">#{e.account.sonolus_handle}</span>
          {#if e.account.admin}
            <span
              class="rounded border border-rose-400/40 bg-rose-400/15 px-1 py-px text-[9px] font-bold text-rose-600 dark:text-rose-300"
              >ADMIN</span
            >
          {:else if e.account.mod}
            <span
              class="rounded border border-violet-400/40 bg-violet-400/15 px-1 py-px text-[9px] font-bold text-violet-600 dark:text-violet-300"
              >MOD</span
            >
          {/if}
        </span>
        <span
          class={cn(
            "mt-0.5 inline-flex w-fit items-center rounded border px-1 py-px text-[10px] font-bold sm:hidden",
            grade.class,
          )}>{grade.label}</span
        >
      </div>

      <!-- judgments -->
      <div
        class="text-muted-foreground hidden w-40 items-center gap-2 text-[11px] tabular-nums sm:flex"
      >
        <span class="inline-flex items-center gap-1">
          <span class={cn("rounded border px-1 py-px text-[10px] font-bold", grade.class)}
            >{grade.label}</span
          >
        </span>
        <span title="perfect / great / good / miss" class="whitespace-nowrap">
          {e.nperfect}<span class="text-muted-foreground/40">/</span>{e.ngreat}<span
            class="text-muted-foreground/40">/</span
          >{e.ngood}<span class="text-muted-foreground/40">/</span>{e.nmiss}
        </span>
      </div>

      <span
        class="text-muted-foreground hidden w-12 text-center text-xs tabular-nums sm:block"
        >×{e.speed.toFixed(1)}</span
      >

      <span class="w-20 text-right text-sm font-bold tabular-nums sm:w-24">{primary(e)}</span>
    </div>
  {/each}
</div>
