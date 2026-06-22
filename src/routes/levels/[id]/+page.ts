import { error } from "@sveltejs/kit";
import {
  getChart,
  getTrends,
  parseDescriptionMeta,
  queryCharts,
  difficultyFromTags,
} from "$lib/data/index.js";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  const chart = getChart(params.id);
  if (!chart) error(404, "That chart doesn't exist (or isn't public).");

  // "Related" = same difficulty band, then topped up with shared-tag charts.
  const difficulty = difficultyFromTags(chart.tags, chart.rating);
  const sameDifficulty = queryCharts({ difficulties: [difficulty], limit: 24 }).data;
  const sharedTags = queryCharts({ tags: chart.tags, limit: 24 }).data;
  const related = [...sameDifficulty, ...sharedTags]
    .filter((c, i, arr) => c.id !== chart.id && arr.findIndex((x) => x.id === c.id) === i)
    .slice(0, 8);

  return {
    chart,
    related,
    trends: getTrends(chart.id),
    meta: parseDescriptionMeta(chart.description),
  };
};
