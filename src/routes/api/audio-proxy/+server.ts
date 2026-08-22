import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ url }) => {
  const target = url.searchParams.get("url");

  if (!target) {
    return new Response("Missing audio URL", { status: 400 });
  }

  let parsed: URL;

  try {
    parsed = new URL(target);
  } catch {
    return new Response("Invalid audio URL", { status: 400 });
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    return new Response("Unsupported audio URL", { status: 400 });
  }

  try {
    const res = await fetch(parsed.toString(), {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome Safari/537.36"
      }
    });

    if (!res.ok || !res.body) {
      return new Response("Audio unavailable", { status: 502 });
    }

    return new Response(res.body, {
      status: 200,
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "audio/mpeg",
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch (error) {
    console.error("Audio proxy failed:", error);
    return new Response("Audio proxy failed", { status: 502 });
  }
};