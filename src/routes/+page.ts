import { fetchCharts } from "$lib/data/index.js";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => {
  const staff = await fetchCharts(fetch, { type: "advanced", staff_pick: 1, limit: 10 });

  return {
    featured: staff.data.slice(0, 5),
    staffPicks: staff.data,
    trending: fetchCharts(fetch, { type: "advanced", sort_by: "decaying_likes", limit: 10 }).then(
      (r) => r.data,
    ),
    newest: fetchCharts(fetch, {
      page: 0,
      type: "quick",
      sort_by: "created_at",
      sort_order: "desc",
      limit: 10,
    }).then((r) => r.data),
  };
};
