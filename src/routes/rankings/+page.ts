import { fetchCharts } from "$lib/data/index.js";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => ({
  charts: fetchCharts(fetch, { type: "advanced", sort_by: "decaying_likes", limit: 12 }).then(
    (r) => r.data,
  ),
});
