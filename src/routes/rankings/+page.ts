import { fetchCharts } from "$lib/data/index.js";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  const res = await fetchCharts(fetch, { type: "advanced", sort_by: "decaying_likes", limit: 12 });
  return { charts: res.data };
};
