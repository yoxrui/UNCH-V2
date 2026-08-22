/** Presentation helpers — turn API-shaped data into display values. */
import type { LeaderboardType } from "./types.js";

/* ------------------------------------------------------------------ *
 * Difficulty (derived from `tags` + `rating` — the API has no explicit
 * difficulty field, only free-form tags and an integer rating).
 * ------------------------------------------------------------------ */

export const DIFFICULTIES = [
  "EASY",
  "NORMAL",
  "HARD",
  "EXPERT",
  "MASTER",
  "APPEND",
] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** PJSK-flavoured colour language for each difficulty (badge / dot / ring). */
export const difficultyMeta: Record<
  Difficulty,
  { badge: string; dot: string; ring: string }
> = {
  EASY: {
    badge: "border-emerald-400/30 bg-emerald-400/15 text-emerald-600 dark:text-emerald-300",
    dot: "bg-emerald-400",
    ring: "ring-emerald-400/50",
  },
  NORMAL: {
    badge: "border-sky-400/30 bg-sky-400/15 text-sky-600 dark:text-sky-300",
    dot: "bg-sky-400",
    ring: "ring-sky-400/50",
  },
  HARD: {
    badge: "border-amber-400/30 bg-amber-400/15 text-amber-600 dark:text-amber-300",
    dot: "bg-amber-400",
    ring: "ring-amber-400/50",
  },
  EXPERT: {
    badge: "border-rose-400/30 bg-rose-400/15 text-rose-600 dark:text-rose-300",
    dot: "bg-rose-400",
    ring: "ring-rose-400/50",
  },
  MASTER: {
    badge: "border-fuchsia-400/30 bg-fuchsia-400/15 text-fuchsia-600 dark:text-fuchsia-300",
    dot: "bg-fuchsia-400",
    ring: "ring-fuchsia-400/50",
  },
  APPEND: {
    badge:
      "border-pink-400/40 bg-linear-to-r from-pink-400/20 to-purple-400/20 text-pink-600 dark:text-pink-200",
    dot: "bg-linear-to-r from-pink-400 to-purple-400",
    ring: "ring-pink-400/50",
  },
};

const TAG_TOKENS: { re: RegExp; d: Difficulty }[] = [
  { re: /^(append|apd|app)$/i, d: "APPEND" },
  { re: /^(master|mas|mst)$/i, d: "MASTER" },
  { re: /^(expert|exp|ex)$/i, d: "EXPERT" },
  { re: /^(hard|hd|hrd)$/i, d: "HARD" },
  { re: /^(normal|norm|nor|nm)$/i, d: "NORMAL" },
  { re: /^(easy|ez|esy)$/i, d: "EASY" },
];

/** Best-effort difficulty: a known tag token wins, else fall back on rating. */
export function difficultyFromTags(tags: string[], rating: number): Difficulty {
  for (const tag of tags) {
    const hit = TAG_TOKENS.find((t) => t.re.test(tag.trim()));
    if (hit) return hit.d;
  }
  if (rating >= 34) return "APPEND";
  if (rating >= 30) return "MASTER";
  if (rating >= 24) return "EXPERT";
  if (rating >= 18) return "HARD";
  if (rating >= 10) return "NORMAL";
  return "EASY";
}

/* ------------------------------------------------------------------ *
 * Numbers & time
 * ------------------------------------------------------------------ */

/** 13 -> "13", 2823 -> "2.8k", 1_200_000 -> "1.2m". */
export function compact(n: number): string {
  if (n < 1000) return `${n}`;
  if (n < 1_000_000) {
    const v = n / 1000;
    return `${v >= 100 ? Math.round(v) : v.toFixed(1).replace(/\.0$/, "")}k`;
  }
  const v = n / 1_000_000;
  return `${v.toFixed(1).replace(/\.0$/, "")}m`;
}

/** Full grouped number, e.g. 998189 -> "998,189". */
export function grouped(n: number): string {
  return n.toLocaleString("en-US");
}

/** Picks the singular or plural word for a count, e.g. plural(1, "chart") -> "chart". */
export function plural(n: number, singular: string, pluralForm = `${singular}s`): string {
  return n === 1 ? singular : pluralForm;
}

const RELATIVE_DIVISIONS: { amount: number; unit: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

/** "3 days ago" from an ISO string or epoch ms. `now` is injectable for tests. */
export function relativeTime(input: string | number, now: number = Date.now()): string {
  const then = typeof input === "number" ? input : Date.parse(input);
  if (Number.isNaN(then)) return "";
  let duration = (then - now) / 1000;
  for (const division of RELATIVE_DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }
  return "";
}

/** mm:ss from seconds. */
export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ *
 * Gradient cover placeholders (no real asset path is known — see README).
 * Deterministic from the chart/account id so each one is stable & distinct.
 * ------------------------------------------------------------------ */

const GRADIENTS = [
  "from-fuchsia-600 via-purple-700 to-indigo-900",
  "from-rose-500 via-red-700 to-slate-900",
  "from-cyan-500 via-blue-700 to-indigo-950",
  "from-emerald-500 via-teal-700 to-slate-900",
  "from-amber-500 via-orange-700 to-rose-950",
  "from-violet-500 via-purple-800 to-slate-950",
  "from-sky-500 via-indigo-700 to-purple-950",
  "from-pink-500 via-fuchsia-700 to-indigo-950",
  "from-lime-500 via-emerald-700 to-cyan-950",
  "from-indigo-500 via-blue-700 to-slate-900",
  "from-red-500 via-rose-700 to-purple-950",
  "from-teal-400 via-cyan-700 to-blue-950",
];

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Stable Tailwind gradient classes for a given id. */
export function coverGradient(id: string): string {
  return GRADIENTS[hashString(id) % GRADIENTS.length];
}

/** A distinct second gradient (for banners) from the same id. */
export function bannerGradient(id: string): string {
  return GRADIENTS[(hashString(id) + 5) % GRADIENTS.length];
}

/* ------------------------------------------------------------------ *
 * Leaderboards
 * ------------------------------------------------------------------ */

export const leaderboardMeta: Record<
  LeaderboardType,
  { label: string; short: string; blurb: string }
> = {
  arcade_score_speed: {
    label: "Arcade Score",
    short: "Arcade",
    blurb: "Highest arcade score, speed modifiers allowed.",
  },
  arcade_score_no_speed: {
    label: "Arcade (No Speed)",
    short: "No-Speed",
    blurb: "Highest arcade score with no speed modifiers.",
  },
  accuracy_score: {
    label: "Accuracy",
    short: "Accuracy",
    blurb: "Highest accuracy score.",
  },
  rank_match: {
    label: "Rank Match",
    short: "Rank",
    blurb: "Ranked competitive matches.",
  },
  least_combo_breaks: {
    label: "Least Combo Breaks",
    short: "Combo Breaks",
    blurb: "Fewest combo breaks (great + good + miss).",
  },
  least_misses: {
    label: "Least Misses",
    short: "Misses",
    blurb: "Fewest missed notes.",
  },
  perfect: {
    label: "Most Perfect",
    short: "Perfect",
    blurb: "Most perfect judgments.",
  },
};

export const gradeMeta: Record<string, { label: string; class: string }> = {
  allPerfect: {
    label: "AP",
    class: "border-amber-400/40 bg-amber-400/15 text-amber-600 dark:text-amber-300",
  },
  fullPerfect: {
    label: "FP",
    class: "border-amber-400/40 bg-amber-400/15 text-amber-600 dark:text-amber-300",
  },
  fullCombo: {
    label: "FC",
    class: "border-emerald-400/40 bg-emerald-400/15 text-emerald-600 dark:text-emerald-300",
  },
  clear: {
    label: "Clear",
    class: "border-sky-400/30 bg-sky-400/12 text-sky-600 dark:text-sky-300",
  },
};

export function gradeBadge(grade: string) {
  return (
    gradeMeta[grade] ?? {
      label: grade,
      class: "border-border bg-muted text-muted-foreground",
    }
  );
}

/* ------------------------------------------------------------------ *
 * Description parsing (BPM / notes / combo sometimes live in free text —
 * the only place the API exposes them, per README). Best-effort only.
 * ------------------------------------------------------------------ */

export type ParsedMeta = { bpm?: number; notes?: number; combo?: number };

export function parseDescriptionMeta(description: string | null): ParsedMeta {
  if (!description) return {};
  const grab = (re: RegExp) => {
    const m = description.match(re);
    if (!m) return undefined;
    const n = Number(m[1].replace(/[, ]/g, ""));
    return Number.isFinite(n) ? n : undefined;
  };
  return {
    bpm: grab(/bpm[:\s]*([\d.,]+)/i),
    notes: grab(/(?:note count|notes?)[:\s]*([\d,]+)/i),
    combo: grab(/combo(?:\s*count)?[:\s]*([\d,]+)/i),
  };
}
