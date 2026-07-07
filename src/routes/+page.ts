import { fetchCharts } from "$lib/data/index.js";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  const [staff, trending, newest, all] = await Promise.all([
    fetchCharts(fetch, { type: "advanced", staff_pick: 1, limit: 10 }),
    fetchCharts(fetch, { type: "advanced", sort_by: "decaying_likes", limit: 10 }),
    fetchCharts(fetch, { page: 0, type: "quick", limit: 10 }),
    fetchCharts(fetch, { type: "quick", sort_by: "created_at", sort_order: "desc", limit: 24 }),
  ]);

  return {
    featured: staff.data.slice(0, 5),
    staffPicks: staff.data,
    trending: trending.data,
    newest: newest.data,
    charts: all.data,
  };
};
