import type { Account, Chart } from "$lib/data/index.js";
import { coverUrl, profileUrl, difficultyFromTags, type Difficulty } from "$lib/data/index.js";

type Component = Record<string, unknown>;

const ACCENT: Record<Difficulty, number> = {
  EASY: 0x34d399,
  NORMAL: 0x38bdf8,
  HARD: 0xfbbf24,
  EXPERT: 0xfb7185,
  MASTER: 0xe879f9,
  APPEND: 0xf472b6,
};

function clean(value: string | null | undefined, max = 300): string {
  const text = (value ?? "")
    .replace(/:([a-zA-Z0-9_]+):/g, "")
    .replace(/[*_~`|\\[\]]/g, "")
    .replace(/\s+\n/g, "\n")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function absolute(url: string, origin: string) {
  return url.startsWith("http") ? url : `${origin}${url}`;
}

function container(accent: number, components: (Component | null)[]) {
  return {
    component: {
      type: 17,
      accent_color: accent,
      components: components.filter(Boolean),
    },
  };
}

export function levelEmbed(chart: Chart, origin: string) {
  const page = `${origin}/levels/UnCh-${chart.id}`;
  const cover = coverUrl(chart);
  const description = clean(chart.description, 280);
  const header: Component = {
    type: 10,
    content: [
      `### ${clean(chart.title, 80)}`,
      clean(chart.artists, 80),
      `-# Lv. ${chart.rating} · charted by [${clean(chart.chart_design, 60)}](${origin}/creators/${chart.author_handle})`,
    ].join("\n"),
  };

  return container(ACCENT[difficultyFromTags(chart.tags, chart.rating)], [
    cover ? { type: 9, components: [header], accessory: { type: 11, media: { url: cover } } } : header,
    description ? { type: 10, content: description } : null,
    { type: 12, items: [{ media: { url: `${origin}/og/level/UnCh-${chart.id}` } }] },
    {
      type: 10,
      content: `-# ❤️ ${chart.like_count} ${chart.like_count === 1 ? "like" : "likes"} · 💬 ${chart.comment_count} ${chart.comment_count === 1 ? "comment" : "comments"}`,
    },
    {
      type: 1,
      components: [
        {
          type: 2,
          style: 5,
          label: "Open in Sonolus",
          url: `https://open.sonolus.com/untitledcharts.com/levels/UnCh-${chart.id}`,
        },
        { type: 2, style: 5, label: "View chart", url: page },
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
  const bio = clean(account.description, 280);
  const header: Component = {
    type: 10,
    content: [`### ${clean(account.sonolus_username, 60)}`, `-# #${account.sonolus_handle}${role}`].join("\n"),
  };

  return container(0x38bdf8, [
    {
      type: 9,
      components: [header],
      accessory: { type: 11, media: { url: absolute(profileUrl(account), origin) } },
    },
    bio ? { type: 10, content: bio } : null,
    stats
      ? {
          type: 10,
          content: `**${stats.chartsPublished}** charts · **${stats.likesReceived}** likes · **${stats.commentsReceived}** comments`,
        }
      : null,
    { type: 12, items: [{ media: { url: `${origin}/og/user/${account.sonolus_handle}` } }] },
    {
      type: 1,
      components: [
        { type: 2, style: 5, label: "View profile", url: page },
        {
          type: 2,
          style: 5,
          label: "Browse their charts",
          url: `${origin}/browse?sonolus_handle_is=${account.sonolus_handle}`,
        },
      ],
    },
  ]);
}
