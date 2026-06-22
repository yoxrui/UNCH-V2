/**
 * Types mirroring the real UntitledCharts API (see README.md).
 * This is a no-backend demo: data is mock, but shaped exactly to the API so the
 * UI only ever shows fields the real endpoints return.
 */

export type Account = {
  sonolus_id: string;
  sonolus_handle: number;
  sonolus_username: string;
  profile_hash: string | null;
  banner_hash: string | null;
  description: string | null;
  mod: boolean;
  admin: boolean;
  banned: boolean;
};

export type Chart = {
  id: string;
  rating: number;
  author: string; // sonolus_id of the uploader
  author_handle: number;
  author_full: string; // "Name#handle"
  chart_design: string; // display name(s) of the charter(s)
  title: string;
  artists: string;
  tags: string[];
  description: string | null;
  staff_pick: boolean;
  status: "PUBLIC" | "UNLISTED" | "PRIVATE";
  like_count: number;
  comment_count: number;
  created_at: string; // ISO
  published_at: string; // ISO
  updated_at: string; // ISO
  jacket_file_hash: string;
};

export type Comment = {
  id: number;
  username: string;
  content: string;
  created_at: number; // epoch ms
  deleted_at: number | null;
  account: Account;
};

export const LEADERBOARD_TYPES = [
  "arcade_score_speed",
  "accuracy_score",
  "arcade_score_no_speed",
  "rank_match",
  "least_combo_breaks",
  "least_misses",
  "perfect",
] as const;
export type LeaderboardType = (typeof LEADERBOARD_TYPES)[number];

export type ScoreEntry = {
  id: number;
  engine: string;
  grade: string; // e.g. "allPerfect", "fullCombo", "clear"
  nperfect: number;
  ngreat: number;
  ngood: number;
  nmiss: number;
  arcade_score: number;
  accuracy_score: number;
  speed: number;
  display_name: string;
  account: Account;
  created_at: string; // ISO
};

export type Trends = { likes: number[]; comments: number[] };

/** Accepted `sort_by` values on `GET /api/charts/` (verified against the API). */
export const SORT_OPTIONS = [
  "decaying_likes",
  "created_at",
  "published_at",
  "likes",
  "comments",
  "rating",
  "abc",
  "random",
] as const;
export type SortBy = (typeof SORT_OPTIONS)[number];

export type ChartQuery = {
  sort_by?: SortBy;
  sort_order?: "asc" | "desc";
  /** Free-text query — matches title, artists, or charter name. */
  q?: string;
  staff_pick?: boolean;
  tags?: string[];
  /** Canonical difficulty names (derived from tags+rating); demo-side convenience. */
  difficulties?: string[];
  min_rating?: number;
  max_rating?: number;
  page?: number; // 0-based
  limit?: number;
};
