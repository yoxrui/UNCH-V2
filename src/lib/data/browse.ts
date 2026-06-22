/** UI constants + mapping for the Browse screen → `queryCharts` params. */
import type { ChartQuery, SortBy } from "./types.js";
import type { Difficulty } from "./format.js";

export type SortOption = { key: string; value: SortBy; order: "asc" | "desc"; label: string };

/** Every option maps to a real `sort_by` + `sort_order` the API accepts. */
export const sortOptions: SortOption[] = [
  { key: "decaying_likes:desc", value: "decaying_likes", order: "desc", label: "Trending" },
  { key: "created_at:desc", value: "created_at", order: "desc", label: "Newest" },
  { key: "created_at:asc", value: "created_at", order: "asc", label: "Oldest" },
  { key: "likes:desc", value: "likes", order: "desc", label: "Most liked" },
  { key: "comments:desc", value: "comments", order: "desc", label: "Most discussed" },
  { key: "rating:desc", value: "rating", order: "desc", label: "Level: high → low" },
  { key: "rating:asc", value: "rating", order: "asc", label: "Level: low → high" },
  { key: "abc:asc", value: "abc", order: "asc", label: "A → Z" },
  { key: "random:desc", value: "random", order: "desc", label: "Random" },
];

export type LevelRange = {
  value: string;
  label: string;
  min_rating?: number;
  max_rating?: number;
};

export const levelRanges: LevelRange[] = [
  { value: "any", label: "Any level" },
  { value: "lte24", label: "Lv. 24 & under", max_rating: 24 },
  { value: "25-29", label: "Lv. 25–29", min_rating: 25, max_rating: 29 },
  { value: "30-32", label: "Lv. 30–32", min_rating: 30, max_rating: 32 },
  { value: "33plus", label: "Lv. 33+", min_rating: 33 },
];

export type Filters = {
  q: string; // free-text search
  sort: string; // a sortOptions.key
  difficulties: Difficulty[];
  range: string; // a levelRanges.value
  staffOnly: boolean;
};

export const defaultFilters: Filters = {
  q: "",
  sort: "decaying_likes:desc",
  difficulties: [],
  range: "any",
  staffOnly: false,
};

export function filtersToQuery(f: Filters, page: number, limit: number): ChartQuery {
  const sort = sortOptions.find((o) => o.key === f.sort) ?? sortOptions[0];
  const range = levelRanges.find((r) => r.value === f.range) ?? levelRanges[0];
  return {
    sort_by: sort.value,
    sort_order: sort.order,
    q: f.q.trim() || undefined,
    staff_pick: f.staffOnly || undefined,
    difficulties: f.difficulties.length ? f.difficulties : undefined,
    min_rating: range.min_rating,
    max_rating: range.max_rating,
    page,
    limit,
  };
}

export function isDefault(f: Filters): boolean {
  return (
    f.q.trim() === "" &&
    f.difficulties.length === 0 &&
    f.range === "any" &&
    !f.staffOnly &&
    f.sort === defaultFilters.sort
  );
}

/** Count of active *filter* facets (excludes search + sort) — for the mobile sheet badge. */
export function activeFilterCount(f: Filters): number {
  return f.difficulties.length + (f.range !== "any" ? 1 : 0) + (f.staffOnly ? 1 : 0);
}
