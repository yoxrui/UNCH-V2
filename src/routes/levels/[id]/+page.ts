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
    // the charter's other charts, most liked first; there's no real "related" signal in the API
    moreFromCharter: fetchCharts(fetch, {
      type: "advanced",
      sonolus_handle_is: String(chart.author_handle),
      sort_by: "likes",
      sort_order: "desc",
      limit: 10,
    }).then((r) =>
      r.data.filter((c) => c.id !== chart.id).slice(0, 8),
    ),
    trends,
  };
};
