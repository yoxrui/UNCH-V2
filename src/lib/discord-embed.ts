import type { Account, Chart } from "$lib/data/index.js";
import { assetUrl, coverUrl, profileUrl, bannerUrl, parseDescriptionMeta } from "$lib/data/index.js";
import { CDN_URL, sonolusOpenUrl } from "$lib/config.js";

// Discord component embeds: https://docs.discord.com/developers/link-previews/component-embeds
// Limits worth knowing: one top-level container, at most 40 components, 3,000 bytes of JSON, link buttons
// only (style 5). Built from the chart's own artwork rather than a rendered OG image.

type Component = Record<string, unknown>;

const BLUE = 0x3b8bfd;
const MIKU = 0x39c5bb;

function clean(value: string | null | undefined, max = 300): string {
  const text = (value ?? "")
    .replace(/:([a-zA-Z0-9_]+):/g, "")
    .replace(/[*_~`|\\[\]#]/g, "")
    .replace(/\s+\n/g, "\n")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function absolute(url: string, origin: string) {
  return url.startsWith("http") ? url : `${origin}${url}`;
}

// Discord wants image URLs that end in an image extension; CDN URLs are bare hashes, so route them
// through /cdn on our own domain (see routes/cdn). Local files like /defpfp.webp already have one.
function media(url: string | null, origin: string): string | null {
  if (!url) return null;
  if (!url.startsWith(`${CDN_URL}/`)) return absolute(url, origin);
  const path = url.slice(CDN_URL.length + 1);
  return `${origin}/cdn/${path}${path.endsWith("_webp") ? ".webp" : ".png"}`;
}

function plural(n: number, one: string, many: string) {
  return `${n.toLocaleString("en-US")} ${n === 1 ? one : many}`;
}

function container(accent: number, components: (Component | null)[]) {
  return { component: { type: 17, accent_color: accent, components: components.filter(Boolean) } };
}

const text = (content: string): Component => ({ type: 10, content });
const link = (label: string, url: string): Component => ({ type: 2, style: 5, label, url });
const gallery = (url: string, description: string): Component => ({
  type: 12,
  items: [{ media: { url }, description }],
});

export function levelEmbed(chart: Chart, origin: string) {
  const page = `${origin}/levels/UnCh-${chart.id}`;
  const charter = `${origin}/creators/${chart.author_handle}`;
  const cover = media(coverUrl(chart), origin);
  // only genuine background art goes on top (backgroundUrl() would fall back to the cover)
  const background = media(assetUrl(chart.author, chart.id, chart.background_file_hash), origin);
  const bpm = parseDescriptionMeta(chart.description).bpm;
  const description = clean(chart.description, 200);

  const heading = text(
    [
      `## [${clean(chart.title, 70)}](${page})`,
      clean(chart.artists, 80),
      `-# Lv. ${chart.rating} · charted by [${clean(chart.chart_design, 50)}](${charter})`,
    ].join("\n"),
  );

  const stats = [
    `❤️ ${plural(chart.like_count, "like", "likes")}`,
    `💬 ${plural(chart.comment_count, "comment", "comments")}`,
    bpm ? `${bpm} BPM` : null,
    chart.staff_pick ? "⭐ Staff pick" : null,
  ].filter(Boolean);

  return container(BLUE, [
    background ? gallery(background, `${clean(chart.title, 60)} background`) : null,
    cover ? { type: 9, components: [heading], accessory: { type: 11, media: { url: cover }, description: "Cover" } } : heading,
    description ? text(description) : null,
    { type: 14, divider: true, spacing: 1 },
    text(`-# ${stats.join(" · ")}`),
    {
      type: 1,
      components: [
        link("Open in Sonolus", sonolusOpenUrl(`levels/UnCh-${chart.id}`)),
        link("View chart", page),
        link("Charter's profile", charter),
      ],
    },
  ]);
}

export function userEmbed(
  account: Account,
  stats: { chartsPublished: number; likesReceived: number; commentsReceived: number } | null,
  origin: string,
) {
  const page = `${origin}/creators/${account.sonolus_handle}`;
  const role = account.admin ? " · Admin" : account.mod ? " · Moderator" : "";
  const bio = clean(account.description, 220);

  const heading = text(
    [`## [${clean(account.sonolus_username, 60)}](${page})`, `-# #${account.sonolus_handle}${role}`].join("\n"),
  );

  return container(MIKU, [
    account.banner_hash ? gallery(media(bannerUrl(account), origin)!, `${clean(account.sonolus_username, 60)}'s banner`) : null,
    {
      type: 9,
      components: [heading],
      accessory: { type: 11, media: { url: media(profileUrl(account), origin) }, description: "Avatar" },
    },
    bio ? text(bio) : null,
    stats
      ? text(
          `-# 🎵 ${plural(stats.chartsPublished, "chart", "charts")} · ❤️ ${plural(stats.likesReceived, "like", "likes")} · 💬 ${plural(stats.commentsReceived, "comment", "comments")}`,
        )
      : null,
    {
      type: 1,
      components: [
        link("View profile", page),
        link("Their charts", `${origin}/browse?sonolus_handle_is=${account.sonolus_handle}`),
      ],
    },
  ]);
}
