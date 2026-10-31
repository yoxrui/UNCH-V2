import { renderOgPng, toDataUrl, ogText } from "$lib/server/og/render.js";
import { buildGenericOg } from "$lib/server/og/templates.js";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const title = ogText(url.searchParams.get("title") || "UntitledCharts", 34);
  const subtitle = ogText(
    url.searchParams.get("subtitle") || "A community catalog of Sonolus rhythm-game charts",
    80,
  );

  const [logo, miku] = await Promise.all([
    toDataUrl(`${url.origin}/636a8f1e76b38cb1b9eb0a3d88d7df6f.png`),
    toDataUrl(`${url.origin}/mikudayo.png`),
  ]);

  const markup = buildGenericOg({ title, subtitle, logo, miku });
  const png = await renderOgPng(markup, title + subtitle);
  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
};
