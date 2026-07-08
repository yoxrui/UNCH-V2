import type {
  Account,
  Chart,
  CharterSummary,
  Comment,
  ScoreEntry,
  Trends,
  LeaderboardType,
} from "./types.js";

export const API_URL = "https://sono-api.untitledcharts.com";

type Fetch = typeof fetch;

type RawChart = Record<string, unknown>;

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}
function num(v: unknown, fallback = 0): number {
  return typeof v === "number" ? v : fallback;
}

export function mapChart(r: RawChart): Chart {
  const created = str(r.created_at);
  return {
    id: str(r.id),
    rating: num(r.rating),
    author: str(r.author),
    author_handle: num(r.author_handle),
    author_full: str(r.author_full),
    chart_design: str(r.chart_design) || str(r.author_full),
    title: str(r.title),
    artists: str(r.artists),
    tags: Array.isArray(r.tags) ? (r.tags as string[]) : [],
    description: typeof r.description === "string" ? r.description : null,
    staff_pick: !!r.staff_pick,
    status: (str(r.status, "PUBLIC") as Chart["status"]) || "PUBLIC",
    like_count: num(r.like_count),
    comment_count: num(r.comment_count),
    created_at: created,
    published_at: str(r.published_at) || created,
    updated_at: str(r.updated_at) || created,
    jacket_file_hash: str(r.jacket_file_hash),
    music_file_hash: str(r.music_file_hash),
    background_file_hash:
      str(r.background_file_hash) || str(r.background_v3_file_hash) || str(r.background_v1_file_hash),
  };
}

function mapAccount(a: Record<string, unknown> = {}): Account {
  return {
    sonolus_id: str(a.sonolus_id),
    sonolus_handle: num(a.sonolus_handle),
    sonolus_username: str(a.sonolus_username, "Unknown"),
    profile_hash: typeof a.profile_hash === "string" ? a.profile_hash : null,
    banner_hash: typeof a.banner_hash === "string" ? a.banner_hash : null,
    description: typeof a.description === "string" ? a.description : null,
    mod: !!a.mod,
    admin: !!a.admin,
    banned: !!a.banned,
  };
}

export async function fetchCharts(
  fetchFn: Fetch,
  params: Record<string, string | number | boolean>,
): Promise<{ data: Chart[]; pageCount: number }> {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)]),
  ).toString();
  const res = await fetchFn(`${API_URL}/api/charts?${qs}`);
  if (!res.ok) return { data: [], pageCount: 1 };
  const json = await res.json();
  const data = Array.isArray(json.data) ? json.data.map(mapChart) : [];
  return { data, pageCount: num(json.pageCount, 1) };
}

export async function fetchChart(fetchFn: Fetch, id: string): Promise<Chart | null> {
  const res = await fetchFn(`${API_URL}/api/charts/${id}`);
  if (!res.ok) return null;
  const json = await res.json();
  const raw = json.data ?? json;
  return raw && raw.id ? mapChart(raw) : null;
}

export async function fetchAccountByHandle(
  fetchFn: Fetch,
  handle: string,
): Promise<{ account: Account; charts: Chart[] } | null> {
  const list = await fetchCharts(fetchFn, {
    type: "advanced",
    sonolus_handle_is: handle,
    sort_by: "created_at",
    sort_order: "desc",
    limit: 50,
  });
  if (list.data.length === 0) return null;

  const authorHash = list.data[0].author;
  const nameFromChart = str(list.data[0].author_full).split("#")[0] || "Unknown";

  let account: Account = {
    sonolus_id: authorHash,
    sonolus_handle: Number(handle) || 0,
    sonolus_username: nameFromChart,
    profile_hash: null,
    banner_hash: null,
    description: null,
    mod: false,
    admin: false,
    banned: false,
  };

  try {
    const res = await fetchFn(`${API_URL}/api/accounts/${authorHash}`);
    if (res.ok) {
      const j = await res.json();
      account = mapAccount((j.account ?? j) as Record<string, unknown>);
    }
  } catch {
    void 0;
  }

  return { account, charts: list.data };
}

export async function fetchCharters(fetchFn: Fetch, limit = 100): Promise<CharterSummary[]> {
  const res = await fetchCharts(fetchFn, {
    type: "advanced",
    sort_by: "likes",
    sort_order: "desc",
    limit,
  });

  const byHandle = new Map<number, CharterSummary>();
  for (const c of res.data) {
    if (!c.author_handle) continue;
    let entry = byHandle.get(c.author_handle);
    if (!entry) {
      entry = {
        account: {
          sonolus_id: c.author,
          sonolus_handle: c.author_handle,
          sonolus_username: c.author_full.split("#")[0] || "Unknown",
          profile_hash: null,
          banner_hash: null,
          description: null,
          mod: false,
          admin: false,
          banned: false,
        },
        chartCount: 0,
        totalLikes: 0,
        staffPicks: 0,
      };
      byHandle.set(c.author_handle, entry);
    }
    entry.chartCount += 1;
    entry.totalLikes += c.like_count;
    if (c.staff_pick) entry.staffPicks += 1;
  }

  return [...byHandle.values()].sort((a, b) => b.totalLikes - a.totalLikes);
}

function mapComment(r: Record<string, unknown>): Comment {
  return {
    id: num(r.id),
    username: str(r.username),
    content: str(r.content),
    created_at: num(r.created_at),
    deleted_at: typeof r.deleted_at === "number" ? r.deleted_at : null,
    account: mapAccount(r.account as Record<string, unknown>),
  };
}

export async function fetchComments(
  fetchFn: Fetch,
  id: string,
  page = 0,
  limit = 10,
): Promise<{ data: Comment[]; pageCount: number }> {
  const res = await fetchFn(`${API_URL}/api/charts/${id}/comment/?page=${page}&limit=${limit}`);
  if (!res.ok) return { data: [], pageCount: 1 };
  const json = await res.json();
  const data = Array.isArray(json.data) ? json.data.map(mapComment) : [];
  return { data, pageCount: num(json.pageCount, 1) };
}

export async function fetchTrends(fetchFn: Fetch, id: string): Promise<Trends> {
  const res = await fetchFn(`${API_URL}/api/charts/${id}/trends/`);
  if (!res.ok) return { likes: [], comments: [] };
  const json = await res.json();
  return {
    likes: Array.isArray(json.likes) ? json.likes : [],
    comments: Array.isArray(json.comments) ? json.comments : [],
  };
}

function mapScore(r: Record<string, unknown>): ScoreEntry {
  return {
    id: num(r.id),
    engine: str(r.engine),
    grade: str(r.grade),
    nperfect: num(r.nperfect),
    ngreat: num(r.ngreat),
    ngood: num(r.ngood),
    nmiss: num(r.nmiss),
    arcade_score: num(r.arcade_score),
    accuracy_score: num(r.accuracy_score),
    speed: num(r.speed),
    display_name: str(r.display_name),
    account: mapAccount(r.account as Record<string, unknown>),
    created_at: str(r.created_at),
  };
}

export async function fetchLeaderboard(
  fetchFn: Fetch,
  id: string,
  type: LeaderboardType,
  page = 0,
  limit = 10,
): Promise<{ data: ScoreEntry[]; pageCount: number }> {
  const res = await fetchFn(
    `${API_URL}/api/charts/${id}/leaderboards/?page=${page}&leaderboard_type=${type}&limit=${limit}`,
  );
  if (!res.ok) return { data: [], pageCount: 1 };
  const json = await res.json();
  const data = Array.isArray(json.data) ? json.data.map(mapScore) : [];
  return { data, pageCount: num(json.pageCount, 1) };
}
