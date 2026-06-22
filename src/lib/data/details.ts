/**
 * Per-chart detail data: comments, leaderboards (7 types), trends.
 *
 * The sample chart uses the REAL captured API payloads; every other chart gets
 * deterministic, believable data (seeded by id) so no detail page is ever empty
 * by accident. All shapes match the API (see README.md).
 */
import { getChart } from "./charts.js";
import type {
  Account,
  Comment,
  LeaderboardType,
  ScoreEntry,
  Trends,
} from "./types.js";

const SAMPLE_ID = "c00b96fa72c84094987d0c8ac0915c0c";

/* --------------------------- seeded helpers --------------------------- */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Small deterministic PRNG so server + client render identically. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pad64(n: number): string {
  let h = (n >>> 0).toString(16);
  while (h.length < 8) h = "0" + h;
  return h.repeat(8).slice(0, 64);
}

function account(name: string, handle: number, extra: Partial<Account> = {}): Account {
  return {
    sonolus_id: pad64(hash(`${name}#${handle}`)),
    sonolus_handle: handle,
    sonolus_username: name,
    profile_hash: null,
    banner_hash: null,
    description: null,
    mod: false,
    admin: false,
    banned: false,
    ...extra,
  };
}

/* ------------------------------ players ------------------------------ */

type Player = { name: string; handle: number; mod?: boolean; admin?: boolean };

const PLAYERS: Player[] = [
  { name: "kaki", handle: 596662 },
  { name: "Hellcart", handle: 155343, mod: true },
  { name: "Crypt Rate", handle: 1435253 },
  { name: "Reverie", handle: 880142 },
  { name: "Aoi", handle: 204418 },
  { name: "mochi", handle: 771203 },
  { name: "ELY", handle: 339915, admin: true },
  { name: "spectra", handle: 1120876 },
  { name: "noctyl", handle: 455201 },
  { name: "Pulse", handle: 689330 },
  { name: "Yumeko", handle: 1903442 },
  { name: "frostbyte", handle: 277619 },
  { name: "kanade.", handle: 808213 },
  { name: "VOID", handle: 1442097 },
  { name: "renai", handle: 530084 },
  { name: " githeon", handle: 999120 },
  { name: "akira_55", handle: 612477 },
  { name: "Lumen", handle: 184650 },
  { name: "saberlight", handle: 1330921 },
  { name: "topaz", handle: 740518 },
  { name: "Mirai", handle: 295630 },
  { name: "deltaV", handle: 1668204 },
  { name: "snowmizu", handle: 423097 },
  { name: "Hibiki", handle: 950315 },
];

function rosterFor(seed: number, count: number): Player[] {
  const rng = mulberry32(seed);
  const pool = PLAYERS.slice();
  // Fisher–Yates with the seeded rng.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(count, pool.length));
}

/* ----------------------------- comments ----------------------------- */

const REAL_COMMENTS: Comment[] = [
  {
    id: 34428,
    username: "Crypt Rate#1435253",
    content: "Freaking awesome chart",
    created_at: 1781911112468,
    deleted_at: null,
    account: account("Crypt Rate", 1435253),
  },
  {
    id: 34394,
    username: "Hellcart#155343",
    content: "P E A K . <3",
    created_at: 1781892732563,
    deleted_at: null,
    account: account("Hellcart", 155343, { mod: true }),
  },
  {
    id: 34309,
    username: "kaki#596662",
    content: "i luv this omg",
    created_at: 1781854600104,
    deleted_at: null,
    account: account("kaki", 596662),
  },
];

const COMMENT_TEMPLATES = [
  "this is so fun to play",
  "FC'd it finally!!",
  "the gimmicks are insane",
  "underrated fr",
  "best chart i've played this week",
  "how is this not staff picked",
  "my hands hurt but worth it",
  "🔥🔥🔥",
  "cleared first try lets gooo",
  "the sync is perfect",
  "please make more like this",
  "10/10 patterns",
  "this slaps so hard",
  "AP when??",
  "charting is so clean",
  "love the streams in the chorus",
  "way harder than the rating suggests lol",
  "goated",
  "the flicks got me good",
  "replaying this on loop",
];

const COMMENT_LIMIT = 10;

export function getComments(
  chartId: string,
  page = 0,
  limit = COMMENT_LIMIT,
): { data: Comment[]; pageCount: number; total: number } {
  const chart = getChart(chartId);
  const total = chart?.comment_count ?? 0;
  let all: Comment[];

  if (chartId === SAMPLE_ID) {
    all = REAL_COMMENTS;
  } else if (total === 0) {
    all = [];
  } else {
    const rng = mulberry32(hash(chartId) ^ 0x9e37);
    const roster = rosterFor(hash(chartId), total);
    const end = chart ? Date.parse(chart.updated_at) : Date.now();
    all = Array.from({ length: total }, (_, i) => {
      const p = roster[i % roster.length];
      return {
        id: 90000 + (hash(chartId) % 50000) + i,
        username: `${p.name}#${p.handle}`,
        content: COMMENT_TEMPLATES[Math.floor(rng() * COMMENT_TEMPLATES.length)],
        created_at: end - Math.floor(rng() * 1000 * 60 * 60 * 24 * 30) - i * 60000,
        deleted_at: null,
        account: account(p.name, p.handle, { mod: p.mod, admin: p.admin }),
      } satisfies Comment;
    }).sort((a, b) => b.created_at - a.created_at);
  }

  const pageCount = Math.max(1, Math.ceil((all.length || 1) / limit));
  const start = page * limit;
  return { data: all.slice(start, start + limit), pageCount, total: all.length };
}

/* ---------------------------- leaderboards ---------------------------- */

const REAL_SCORES: ScoreEntry[] = [
  {
    id: 48813,
    engine: "NextRUSH_P",
    grade: "fullCombo",
    nperfect: 1650,
    ngreat: 10,
    ngood: 0,
    nmiss: 0,
    arcade_score: 998189,
    accuracy_score: 991748,
    speed: 1.0,
    display_name: "kaki#596662",
    account: account("kaki", 596662),
    created_at: "2026-06-19T07:57:27Z",
  },
  {
    id: 48953,
    engine: "NextRUSH_P",
    grade: "fullCombo",
    nperfect: 1650,
    ngreat: 10,
    ngood: 0,
    nmiss: 0,
    arcade_score: 998161,
    accuracy_score: 988689,
    speed: 1.0,
    display_name: "Hellcart#155343",
    account: account("Hellcart", 155343, { mod: true }),
    created_at: "2026-06-19T18:15:23Z",
  },
];

function comboBreaks(e: ScoreEntry): number {
  return e.ngood + e.nmiss;
}

function metricValue(e: ScoreEntry, type: LeaderboardType): number {
  switch (type) {
    case "accuracy_score":
      return e.accuracy_score;
    case "least_combo_breaks":
      return -comboBreaks(e); // fewer is better → larger sort key
    case "least_misses":
      return -e.nmiss;
    case "perfect":
      return e.nperfect;
    default:
      return e.arcade_score; // arcade_score_speed / _no_speed / rank_match
  }
}

const LB_LIMIT = 10;

export function getLeaderboard(
  chartId: string,
  type: LeaderboardType,
  page = 0,
  limit = LB_LIMIT,
): { data: ScoreEntry[]; pageCount: number; total: number } {
  const chart = getChart(chartId);
  const likes = chart?.like_count ?? 0;
  // Brand-new / unplayed charts can legitimately have an empty board.
  const count = Math.min(60, Math.round(Math.sqrt(likes) * 1.6));

  const noSpeed = type === "arcade_score_no_speed";
  const seed = hash(chartId) ^ hash(type);
  const rng = mulberry32(seed);
  const roster = rosterFor(seed, count);
  const totalNotes = 900 + (hash(chartId) % 800);
  const baseTime = chart ? Date.parse(chart.published_at) : Date.now();

  let entries: ScoreEntry[] = roster.map((p, i) => {
    // Skill spread: a few near-perfect runs, a long tail of clears.
    const tier = rng();
    const miss = tier > 0.78 ? Math.floor(rng() * 12) : tier > 0.5 ? Math.floor(rng() * 3) : 0;
    const good = miss > 0 ? Math.floor(rng() * 10) : Math.floor(rng() * 2);
    const great = Math.floor(rng() * (miss > 0 ? 30 : 14));
    const perfect = Math.max(0, totalNotes - great - good - miss);
    const grade =
      miss === 0 && good === 0 && great === 0
        ? "allPerfect"
        : miss === 0
          ? "fullCombo"
          : "clear";
    const accuracy_score = Math.round((1_000_000 * (perfect + great * 0.5 + good * 0.2)) / totalNotes);
    const arcade_score = Math.round(
      Math.min(999999, (1_000_000 * (perfect + great * 0.72 + good * 0.4)) / totalNotes - miss * 90),
    );
    const speed = noSpeed ? 1.0 : [1.0, 1.0, 1.0, 1.1, 1.2, 0.9][Math.floor(rng() * 6)];
    return {
      id: 40000 + (hash(chartId + type) % 9000) + i,
      engine: "NextRUSH_P",
      grade,
      nperfect: perfect,
      ngreat: great,
      ngood: good,
      nmiss: miss,
      arcade_score,
      accuracy_score,
      speed,
      display_name: `${p.name}#${p.handle}`,
      account: account(p.name, p.handle, { mod: p.mod, admin: p.admin }),
      created_at: new Date(baseTime + Math.floor(rng() * 1000 * 60 * 60 * 24 * 20)).toISOString(),
    } satisfies ScoreEntry;
  });

  // The sample chart shows its two real top scores for arcade_score_speed.
  if (chartId === SAMPLE_ID && type === "arcade_score_speed") {
    entries = [...REAL_SCORES, ...entries.filter((e) => !REAL_SCORES.some((r) => r.id === e.id))];
  }

  entries.sort((a, b) => metricValue(b, type) - metricValue(a, type));

  const total = entries.length;
  const pageCount = Math.max(1, Math.ceil((total || 1) / limit));
  const start = page * limit;
  return { data: entries.slice(start, start + limit), pageCount, total };
}

/* ------------------------------ trends ------------------------------ */

const REAL_TRENDS: Trends = {
  likes: [1, 1, 9, 47, 85, 100, 100],
  comments: [1, 1, 1, 100, 100, 100, 100],
};

/** 7-point normalized (0–100) activity series, like the API's `/trends/`. */
export function getTrends(chartId: string): Trends {
  if (chartId === SAMPLE_ID) return REAL_TRENDS;
  const chart = getChart(chartId);
  const rng = mulberry32(hash(chartId) ^ 0x5151);
  const peak = chart && chart.like_count > 200 ? 100 : 40 + Math.floor(rng() * 60);

  const series = (spike: boolean) => {
    const out: number[] = [];
    let v = 1 + Math.floor(rng() * 6);
    for (let i = 0; i < 7; i++) {
      const target = (peak * (i + 1)) / 7;
      v = Math.max(v, Math.round(target * (0.55 + rng() * 0.6)));
      if (spike && i >= 4) v = Math.min(100, Math.max(v, peak - Math.floor(rng() * 10)));
      out.push(Math.max(1, Math.min(100, v)));
    }
    return out;
  };

  return { likes: series(true), comments: series(false) };
}
