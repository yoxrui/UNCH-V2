import type { SortBy } from "./types.js";

export type SearchType = "newest" | "random" | "quick" | "advanced";

export const searchTypes: { value: SearchType; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "quick", label: "Quick" },
  { value: "advanced", label: "Advanced" },
  { value: "random", label: "Random" },
];

export const sortByOptions: { value: SortBy; label: string }[] = [
  { value: "created_at", label: "Created Date" },
  { value: "rating", label: "Rating" },
  { value: "likes", label: "Likes" },
  { value: "abc", label: "Alphabetical" },
  { value: "decaying_likes", label: "Decaying Likes" },
];

export const orderOptions: { value: "asc" | "desc"; label: string }[] = [
  { value: "desc", label: "Descending" },
  { value: "asc", label: "Ascending" },
];

export type Filters = {
  searchType: SearchType;
  staffPick: boolean;
  sortBy: SortBy;
  sortOrder: "asc" | "desc";
  keywords: string;
  minRating: string;
  maxRating: string;
  titleIncludes: string;
  descriptionIncludes: string;
  artistsIncludes: string;
  tags: string;
  authorHandle: string;
};

export const defaultFilters: Filters = {
  searchType: "newest",
  staffPick: false,
  sortBy: "decaying_likes",
  sortOrder: "desc",
  keywords: "",
  minRating: "",
  maxRating: "",
  titleIncludes: "",
  descriptionIncludes: "",
  artistsIncludes: "",
  tags: "",
  authorHandle: "",
};

export function filtersToApiParams(
  f: Filters,
  page: number,
  limit: number,
): Record<string, string | number> {
  const actualType = f.searchType === "newest" ? "quick" : f.searchType;
  const params: Record<string, string | number> = { type: actualType, page, limit };

  if (f.staffPick && actualType !== "random") params.staff_pick = 1;
  if (f.authorHandle.trim()) params.sonolus_handle_is = f.authorHandle.trim();

  if (actualType === "quick") {
    if (f.keywords.trim()) params.meta_includes = f.keywords.trim();
    params.sort_by = f.searchType === "newest" ? "created_at" : f.sortBy;
    params.sort_order = f.sortOrder;
  } else if (f.searchType === "advanced") {
    if (f.titleIncludes.trim()) params.title_includes = f.titleIncludes.trim();
    else if (f.keywords.trim()) params.title_includes = f.keywords.trim();
    if (f.descriptionIncludes.trim()) params.description_includes = f.descriptionIncludes.trim();
    if (f.artistsIncludes.trim()) params.artists_includes = f.artistsIncludes.trim();
    if (f.minRating.trim()) params.minR = f.minRating.trim();
    if (f.maxRating.trim()) params.maxR = f.maxRating.trim();
    if (f.tags.trim()) params.tags = f.tags.trim();
    params.sort_by = f.sortBy;
    params.sort_order = f.sortOrder;
  }
  return params;
}

export function isDefault(f: Filters): boolean {
  return (
    f.searchType === defaultFilters.searchType &&
    !f.staffPick &&
    f.sortBy === defaultFilters.sortBy &&
    f.sortOrder === "desc" &&
    f.keywords.trim() === "" &&
    f.minRating === "" &&
    f.maxRating === "" &&
    f.titleIncludes === "" &&
    f.descriptionIncludes === "" &&
    f.artistsIncludes === "" &&
    f.tags === "" &&
    f.authorHandle === ""
  );
}

export function activeFilterCount(f: Filters): number {
  let n = 0;
  if (f.staffPick) n++;
  if (f.minRating || f.maxRating) n++;
  if (f.tags.trim()) n++;
  if (f.authorHandle.trim()) n++;
  if (f.titleIncludes || f.descriptionIncludes || f.artistsIncludes) n++;
  return n;
}
