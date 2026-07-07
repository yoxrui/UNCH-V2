import { error } from "@sveltejs/kit";
import { fetchChart, fetchCharts, fetchTrends, parseDescriptionMeta } from "$lib/data/index.js";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  const id = params.id.replace(/^unch-/i, "");
  const chart = await fetchChart(fetch, id);
  if (!chart) error(404, "That chart doesn't exist (or isn't public).");

  const [relatedRes, trends] = await Promise.all([
    fetchCharts(fetch, { type: "quick", sort_by: "decaying_likes", limit: 9 }),
    fetchTrends(fetch, chart.id),
  ]);
  const related = relatedRes.data.filter((c) => c.id !== chart.id).slice(0, 8);

  return {
    chart,
    related,
    trends,
    meta: parseDescriptionMeta(chart.description),
  };
};
