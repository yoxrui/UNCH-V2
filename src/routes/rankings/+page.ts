import { queryCharts } from "$lib/data/index.js";
import type { PageLoad } from "./$types";

export const load: PageLoad = () => ({
  charts: queryCharts({ sort_by: "decaying_likes", limit: 12 }).data,
});
