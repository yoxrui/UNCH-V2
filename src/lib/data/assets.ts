import type { Chart } from "./types.js";

export const ASSET_BASE_URL = "https://cdn.untitledcharts.com";

export const DEFAULT_AVATAR = "/defpfp.webp";
export const DEFAULT_BANNER = "/def.webp";

export function assetUrl(author: string, id: string, hash: string | null | undefined): string | null {
  if (!author || !id || !hash) return null;
  return `${ASSET_BASE_URL}/${author}/${id}/${hash}`;
}

export function coverUrl(chart: Chart): string | null {
  return assetUrl(chart.author, chart.id, chart.jacket_file_hash);
}

export function bgmUrl(chart: Chart): string | null {
  return assetUrl(chart.author, chart.id, chart.music_file_hash);
}

export function backgroundUrl(chart: Chart): string | null {
  return assetUrl(chart.author, chart.id, chart.background_file_hash) ?? coverUrl(chart);
}

export function bgmProxyUrl(chart: Chart): string | null {
  const url = bgmUrl(chart);
  return url ? `/api/audio-proxy?url=${encodeURIComponent(url)}` : null;
}

export function profileUrl(account: { sonolus_id: string; profile_hash: string | null }): string {
  if (!account.profile_hash || !account.sonolus_id) return DEFAULT_AVATAR;
  return `${ASSET_BASE_URL}/${account.sonolus_id}/profile/${account.profile_hash}_webp`;
}

export function bannerUrl(account: { sonolus_id: string; banner_hash: string | null }): string {
  if (!account.banner_hash || !account.sonolus_id) return DEFAULT_BANNER;
  return `${ASSET_BASE_URL}/${account.sonolus_id}/banner/${account.banner_hash}_webp`;
}
