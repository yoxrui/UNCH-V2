import { error } from "@sveltejs/kit";
import {
  fetchChart,
  fetchCharts,
  fetchTrends,
  fetchAccountById,
} from "$lib/data/index.js";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  const id = params.id.replace(/^unch-/i, "");
  const chart = await fetchChart(fetch, id);
  if (!chart) error(404, "That chart doesn't exist (or isn't public).");

  const trends = await fetchTrends(fetch, chart.id);

  return {
    chart,
    author: fetchAccountById(fetch, chart.author),
    related: fetchCharts(fetch, { type: "quick", sort_by: "decaying_likes", limit: 9 }).then((r) =>
      r.data.filter((c) => c.id !== chart.id).slice(0, 8),
    ),
    trends,
  };
};
