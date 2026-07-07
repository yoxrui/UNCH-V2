import { error } from "@sveltejs/kit";
import { ASSET_BASE_URL } from "$lib/data/index.js";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url, fetch }) => {
  const target = url.searchParams.get("url");
  if (!target || !target.startsWith(ASSET_BASE_URL)) error(400, "Invalid url");

  const res = await fetch(target);
  if (!res.ok) error(res.status, "Failed to fetch audio");

  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
};
