/** Charter accounts — derived from the chart pool (`GET /api/accounts/{id}/`). */
import { CHARTERS, charts } from "./charts.js";
import type { Account, Chart } from "./types.js";

type CharterSeed = (typeof CHARTERS)[keyof typeof CHARTERS];

function toAccount(seed: CharterSeed): Account {
  return {
    sonolus_id: seed.id,
    sonolus_handle: seed.handle,
    sonolus_username: seed.name,
    profile_hash: null,
    banner_hash: null,
    description: "description" in seed ? (seed.description ?? null) : null,
    mod: "mod" in seed ? !!seed.mod : false,
    admin: "admin" in seed ? !!seed.admin : false,
    banned: false,
  };
}

function chartsByAuthor(id: string): Chart[] {
  return charts
    .filter((c) => c.author === id)
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
}

/** Profile + all of that charter's charts. `undefined` → 404. */
export function getAccount(id: string): { account: Account; charts: Chart[] } | undefined {
  const seed = Object.values(CHARTERS).find((c) => c.id === id);
  if (!seed) return undefined;
  return { account: toAccount(seed), charts: chartsByAuthor(id) };
}

export type CharterSummary = {
  account: Account;
  chartCount: number;
  totalLikes: number;
  staffPicks: number;
  topChart?: Chart;
};

/** All charters with at least one chart, ranked by total likes (Creators index). */
export function allCharters(): CharterSummary[] {
  return Object.values(CHARTERS)
    .map((seed) => {
      const theirs = chartsByAuthor(seed.id);
      const totalLikes = theirs.reduce((sum, c) => sum + c.like_count, 0);
      const topChart = theirs.reduce<Chart | undefined>(
        (best, c) => (!best || c.like_count > best.like_count ? c : best),
        undefined,
      );
      return {
        account: toAccount(seed),
        chartCount: theirs.length,
        totalLikes,
        staffPicks: theirs.filter((c) => c.staff_pick).length,
        topChart,
      };
    })
    .filter((c) => c.chartCount > 0)
    .sort((a, b) => b.totalLikes - a.totalLikes);
}
