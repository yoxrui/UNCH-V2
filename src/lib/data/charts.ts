/**
 * The chart pool + an API-faithful query layer.
 *
 * Data is real (captured from the live API) but served locally — no backend.
 * `queryCharts` replicates the documented `GET /api/charts/` params
 * (sort_by / sort_order / staff_pick / tags / min_rating / max_rating / page /
 * limit) so the browse + home + rankings screens behave like the real thing.
 */
import { difficultyFromTags } from "./format.js";
import type { Chart, ChartQuery, SortBy } from "./types.js";

type CharterSeed = {
  id: string;
  handle: number;
  name: string;
  mod?: boolean;
  admin?: boolean;
  description?: string;
};

/** Charter identities (shared by charts.ts and accounts.ts to avoid a cycle). */
export const CHARTERS = {
  chungpodo: {
    id: "5d0c6e5389a046b39c72187f8543e784347072094c3085b942c12624eaa76cfb",
    handle: 342249,
    name: "Chungpodo",
    description: "Hatsune Miku enjoyer. 初音狂奏曲 series + the occasional CHUNITHM port.",
  },
  aspho: {
    id: "8c9fa1c235539e4966c580ee68cd85b94bac52ea6af03e3b08c9a758177552fc",
    handle: 76829,
    name: "AsPho",
    description: "Audio cuts, cover images, and the occasional MASTER. Collab enjoyer.",
  },
  chinori: {
    id: "937ff86062628ee938b4fdd8691397729802ca3b13adce1df4039112b34defbf",
    handle: 109639,
    name: "IFLA: Chinori",
  },
  ababik: {
    id: "c1c1fcc98cb6e587c04c05c9117bf88f854e4cb3af93caaa836fddd87369db2b",
    handle: 1317412,
    name: "Абабик",
  },
  patenero: {
    id: "73ec0cde2c5f640ad5847b24f94413dd8105fb6da4978ca818404c2d2bb287f5",
    handle: 1862905,
    name: "Patenero Pallateo",
    description: "Teto & Miku charts. Combo counts in every description.",
  },
  nitro: {
    id: "24ad2212e134685ec797e9b63449e5c70716430ca44310acde1480f0a809ec67",
    handle: 663833,
    name: "nitro",
  },
  salada: {
    id: "2821cb02350f0a6f610ee1bae22f05952a0db2e267e821247ecf7540a917d268",
    handle: 570699,
    name: "Salada",
    mod: true,
    description: "Dynamic Stages gimmick charter. Tutorials in the descriptions ♪",
  },
  ev: {
    id: "4f0c5c03313ca1aa16898a9368d4174ad8ef52101e67c44ec4438a71cb3ad001",
    handle: 303478,
    name: "Ev",
    description: "ZUTOMAYO mostly. Leave a comment for requests!",
  },
  toaster: {
    id: "e9a9fed5ba081b7a11c185f426da81a4fc2404dc55cf81f1d990585531aaf827",
    handle: 159056,
    name: "熱壓吐司",
  },
  spookilyboo: {
    id: "8d52467042945448523918c1502430e7626514b94419c2a3b954cf0a00eca656",
    handle: 1187017,
    name: "SpookilyBoo",
  },
  libsra: {
    id: "5f04a05791ad27f486f999fe8948ac69bb5c450def1cadbee0b96a081c242831",
    handle: 1887963,
    name: "libsra",
  },
  galleto: {
    id: "d99f1ccd0a48041a45fe1429a6e64b164f1c512d84d0fa03c4aa615354b43892",
    handle: 341792,
    name: "GaIIeto",
  },
  del: {
    id: "04401f03204e5d0833251c3b7a63c7f6cd4af883dbec54eb9f84811b6914127e",
    handle: 1286102,
    name: "Del",
  },
  defecter: {
    id: "2a13644aa5a1080298bdd1e94924a8ddfcb61350592de88f8081fd66e1ce80bb",
    handle: 292964,
    name: "defecter",
  },
  meteoricer: {
    id: "ea7ccf9271d6254fdfefad449eef89d7b7eb5113d665b49cc940c16324bbf455",
    handle: 858279,
    name: "Meteoricer",
  },
} satisfies Record<string, CharterSeed>;

export type CharterKey = keyof typeof CHARTERS;

type ChartSeed = {
  id: string;
  rating: number;
  title: string;
  artists: string;
  tags: string[];
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at?: string;
  staff_pick?: boolean;
  description?: string;
  chart_design?: string;
  jacket_file_hash?: string;
};

function mk(charter: CharterKey, c: ChartSeed): Chart {
  const ch = CHARTERS[charter];
  return {
    id: c.id,
    rating: c.rating,
    title: c.title,
    artists: c.artists,
    tags: c.tags,
    description: c.description ?? null,
    staff_pick: c.staff_pick ?? false,
    status: "PUBLIC",
    like_count: c.like_count,
    comment_count: c.comment_count,
    created_at: c.created_at,
    published_at: c.created_at,
    updated_at: c.updated_at ?? c.created_at,
    author: ch.id,
    author_handle: ch.handle,
    author_full: `${ch.name}#${ch.handle}`,
    chart_design: c.chart_design ?? ch.name,
    jacket_file_hash: c.jacket_file_hash ?? "",
  };
}

export const charts: Chart[] = [
  mk("chungpodo", { id: "c00b96fa72c84094987d0c8ac0915c0c", rating: 32, title: "初音狂奏曲第01番「彗惺」", artists: "よみぃ", tags: ["EXPERT", "EX", "ultimate"], like_count: 13, comment_count: 3, created_at: "2026-06-18T11:25:24Z", updated_at: "2026-06-19T18:11:51Z", staff_pick: true, jacket_file_hash: "22c16bae74b0017b08f5a1e622e0b02c7fa30043" }),
  mk("aspho", { id: "add7101bee6643869190f818aa5b2871", rating: 30, title: "Pajamy", artists: "iyowa feat. Hatsune Miku", tags: ["MASTER"], like_count: 4, comment_count: 0, created_at: "2026-06-21T21:08:18Z", updated_at: "2026-06-21T21:31:34Z", staff_pick: true, description: "24th" }),
  mk("aspho", { id: "9fc91ad23a284cfd8ab7f7c46a37c785", rating: 33, title: "Future-Respawning Button", artists: "Camellia feat. Hatsune Miku", tags: ["MASTER"], like_count: 5, comment_count: 0, created_at: "2026-06-21T12:17:09Z", updated_at: "2026-06-21T14:10:34Z", staff_pick: true, chart_design: "DomaKocmoc#350268, AsPho", description: "Collab #2\n\nVerified FC (7/0/0)\nAudio cut, cover image made by AsPho" }),
  mk("chinori", { id: "877dcbc830b24edda416cc26ee6dc34f", rating: 32, title: "Kaleidoscope", artists: "Lycoris in the parterre", tags: [], like_count: 5, comment_count: 1, created_at: "2026-06-20T02:29:29Z", updated_at: "2026-06-21T10:11:23Z", staff_pick: true, description: "BPM: 150\nNote Count: 1315\nChart Type: DX" }),
  mk("ababik", { id: "824201111a9e41ccb186405c002f07de", rating: 30, title: "バースデイ【Dynamic Stages】", artists: "内緒のピアス", tags: ["MASTER", "ababik"], like_count: 22, comment_count: 3, created_at: "2026-06-19T19:57:31Z", updated_at: "2026-06-19T21:12:19Z", staff_pick: true }),
  mk("patenero", { id: "75c6c8817d6a4420b51b3bc8accfefc1", rating: 24, title: "SOSORRY!", artists: "ePiaeon", tags: ["Expert", "Miku"], like_count: 38, comment_count: 2, created_at: "2026-06-17T17:34:30Z", updated_at: "2026-06-18T01:48:32Z", staff_pick: true, description: "Vocal: 初音ミク\n\nCombo Count: 1069\n\nso sorry" }),
  mk("nitro", { id: "ab63b7064b424578abe82ae21a77076a", rating: 30, title: "SOSORRY!", artists: "ePiaeon ft. Hatsune Miku", tags: ["english", "master", "sosorry"], like_count: 13, comment_count: 1, created_at: "2026-06-17T14:57:40Z", updated_at: "2026-06-19T16:20:44Z", staff_pick: true, description: "30.3" }),
  mk("salada", { id: "f6208ff2f5014041b5a23c49af1a113f", rating: 29, title: "Looping The Rooms (Dynamic Stages)", artists: "Rusino", tags: ["Master", "Gimmick"], like_count: 187, comment_count: 17, created_at: "2026-06-16T16:42:00Z", updated_at: "2026-06-16T19:39:52Z", staff_pick: true, description: "Tutorial for the gimmicks here:\nhttps://sonolus-next-sekai-dynamic-stages-guide.pages.dev/" }),
  mk("nitro", { id: "ce5fd11a1ea94959a906bc66e853fe39", rating: 30, title: "碧天伴走", artists: "MyGO!!!!", tags: ["mygo", "bandori", "master"], like_count: 2, comment_count: 1, created_at: "2026-06-16T02:07:41Z", updated_at: "2026-06-16T22:15:35Z", staff_pick: true, description: "30.4" }),
  mk("ev", { id: "072588c1feae43eeaa1bc92cad3353e9", rating: 31, title: "メディアノーチェ", artists: "ずっと真夜中でいいのに (ZUTOMAYO)", tags: ["MASTER"], like_count: 13, comment_count: 3, created_at: "2026-06-15T20:51:23Z", updated_at: "2026-06-19T17:55:13Z", staff_pick: true, description: "もし見たいZUTOMAYOのチャートが他にあったら、コメントを残してね！\n\nPlease leave a comment if there are other ZUTOMAYO charts you'd like to see!" }),
  mk("chungpodo", { id: "8fd4a979772b438882528cbd292d5b2b", rating: 37, title: "初音狂奏曲第01番「彗惺」", artists: "よみぃ", tags: ["APPEND", "APD", "Ultimate"], like_count: 7, comment_count: 0, created_at: "2026-06-12T10:18:49Z", updated_at: "2026-06-19T06:19:34Z" }),
  mk("chungpodo", { id: "2e3e7ae383f7411f9fd42c81ccdb68ba", rating: 35, title: "CIRCUS PANIC!!!", artists: "サツキ", tags: ["APPEND", "APD"], like_count: 5, comment_count: 1, created_at: "2026-06-07T05:16:06Z", updated_at: "2026-06-07T13:17:19Z" }),
  mk("salada", { id: "1eb69c7606974e52ba9cb0af74d4e8b2", rating: 29, title: "YARARARA (Dynamic Stages)", artists: "AnythingBecomeMoe & TEKOKITO", tags: ["Master", "Gimmick"], like_count: 2823, comment_count: 105, created_at: "2026-06-05T20:07:42Z", updated_at: "2026-06-10T19:36:31Z", staff_pick: true }),
  mk("salada", { id: "d10895f856ff4785b6bd0de4112d417c", rating: 29, title: "처형박수 [Execution Clap] (Gimmicky)", artists: "Trap Chick", tags: ["Master", "Gimmick"], like_count: 2947, comment_count: 137, created_at: "2026-02-17T16:00:28Z", updated_at: "2026-05-20T11:30:29Z", staff_pick: true }),
  mk("toaster", { id: "c79c2362de0445c8847567c57f9a94a2", rating: 28, title: "The One Who's Running The Show", artists: "Gooseworx / Glitch", tags: [], like_count: 5454, comment_count: 308, created_at: "2026-03-22T16:19:26Z", updated_at: "2026-05-02T11:21:17Z", staff_pick: true, description: "tadc is so peak...\ncombo: 1057\nthe difficulty is based on frequent bpm changes." }),
  mk("patenero", { id: "1e7f267abe9e4cbcbe0910a7b7f6339b", rating: 19, title: "ヤラララ", artists: "AnythingBecomeMoe", tags: ["Hard", "Teto"], like_count: 151, comment_count: 7, created_at: "2026-06-03T00:03:51Z", updated_at: "2026-06-03T00:06:02Z", description: "English Title: YARARARA\n\nVocal: 重音テト\n\nCombo Count: 846" }),
  mk("spookilyboo", { id: "34934de90bd74d05ad3faf4c40b2acdd", rating: 31, title: "BANG BANG BANG [Dynamic Stages]", artists: "bb-panzu (ft. starxrayne & JamsDx)", tags: ["Master", "Gimmick", "Dynamic"], like_count: 191, comment_count: 14, created_at: "2026-06-12T18:36:52Z", updated_at: "2026-06-19T16:02:24Z", staff_pick: true, description: "Combo: 1179\nDuration: 3:00\nBPM: 133\n\nChainsaw Man Song" }),
  mk("libsra", { id: "af693dd8a8114afe826d8ff8eb56dd92", rating: 21, title: "Hazy Moon Jumpstyle — Expert", artists: "PHXKHXNG", tags: ["Jumpstyle"], like_count: 470, comment_count: 10, created_at: "2026-02-10T18:49:35Z", updated_at: "2026-02-10T18:55:45Z" }),
  mk("salada", { id: "ba6d07998d8540a9a1fbc07952c782e2", rating: 30, title: "Approve Please, Genie! (Dynamic Stages)", artists: "Trap Chick", tags: ["Master", "Gimmick"], like_count: 263, comment_count: 20, created_at: "2026-06-05T20:10:57Z", updated_at: "2026-06-11T01:48:01Z" }),
  mk("galleto", { id: "17ec1706b39c444dac608bbb0973c74b", rating: 25, title: "退廃的人生讃歌【EXPERT】", artists: "Ro2noki / 重音テト", tags: ["EXPERT", "Ro2noki", "UTAU"], like_count: 183, comment_count: 6, created_at: "2025-11-14T00:07:40Z", updated_at: "2026-03-24T03:43:32Z", description: "Lyrics: Ro2noki\nMusic: Ro2noki\nBPM: 132\nCombo: 1119" }),
  mk("del", { id: "be48c6586ca841df994b4d559a1e7f96", rating: 29, title: "ICONIC BY MISTAKE", artists: "LE SSERAFIM / ILLIT / KATSEYE", tags: ["Hybe", "KPOP", "K-pop"], like_count: 3, comment_count: 0, created_at: "2026-06-21T22:07:41Z", updated_at: "2026-06-21T22:08:33Z", description: "BPM: 126\nNotes: 1031\nCombo: 937\n\nIm still a beginner at making charts" }),
  mk("defecter", { id: "572b15925a724fc7a0ef992fada9ef5d", rating: 30, title: "Road to Aventura", artists: "s-don", tags: ["MASTER", "CHUNITHM"], like_count: 1, comment_count: 0, created_at: "2026-06-21T20:55:57Z", updated_at: "2026-06-21T21:07:34Z" }),
  mk("meteoricer", { id: "5c52898a319c497c97c8c170efc319df", rating: 28, title: "SOSORRY!", artists: "ePiaeon", tags: ["Master"], like_count: 0, comment_count: 0, created_at: "2026-06-21T23:25:37Z", updated_at: "2026-06-21T23:33:33Z", description: "im sorry for everything i did to you" }),
];

/* ----------------------------- querying ----------------------------- */

const NOW = Date.now();

function idHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** "decaying likes" proxy: likes damped by age, so recent+liked floats up. */
function decayScore(c: Chart): number {
  const ageDays = Math.max(0, (NOW - Date.parse(c.published_at)) / 86_400_000);
  return c.like_count / Math.pow(ageDays + 2, 0.85);
}

function sortValue(c: Chart, key: SortBy): number | string {
  switch (key) {
    case "likes":
      return c.like_count;
    case "comments":
      return c.comment_count;
    case "rating":
      return c.rating;
    case "created_at":
      return Date.parse(c.created_at);
    case "published_at":
      return Date.parse(c.published_at);
    case "abc":
      return c.title.toLocaleLowerCase();
    case "decaying_likes":
      return decayScore(c);
    case "random":
      return idHash(c.id);
  }
}

export function queryCharts(q: ChartQuery = {}): { data: Chart[]; pageCount: number; total: number } {
  const {
    sort_by = "decaying_likes",
    sort_order = "desc",
    q: text,
    staff_pick,
    tags,
    difficulties,
    min_rating,
    max_rating,
    page = 0,
    limit = 12,
  } = q;

  let list = charts.slice();
  const needle = text?.trim().toLowerCase();
  if (needle) {
    list = list.filter((c) =>
      [c.title, c.artists, c.chart_design, ...c.tags]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }
  if (staff_pick) list = list.filter((c) => c.staff_pick);
  if (tags?.length) {
    const want = tags.map((t) => t.toLowerCase());
    list = list.filter((c) => c.tags.some((t) => want.includes(t.toLowerCase())));
  }
  if (difficulties?.length) {
    list = list.filter((c) => difficulties.includes(difficultyFromTags(c.tags, c.rating)));
  }
  if (typeof min_rating === "number") list = list.filter((c) => c.rating >= min_rating);
  if (typeof max_rating === "number") list = list.filter((c) => c.rating <= max_rating);

  const dir = sort_order === "asc" ? 1 : -1;
  list.sort((a, b) => {
    const va = sortValue(a, sort_by);
    const vb = sortValue(b, sort_by);
    const cmp =
      typeof va === "string" || typeof vb === "string"
        ? String(va).localeCompare(String(vb))
        : (va as number) - (vb as number);
    // `random` ignores order (stable pseudo-random); abc reads naturally ascending.
    if (sort_by === "random") return cmp;
    return cmp * dir;
  });

  const total = list.length;
  const pageCount = Math.max(1, Math.ceil(total / limit));
  const start = page * limit;
  return { data: list.slice(start, start + limit), pageCount, total };
}

export function getChart(id: string): Chart | undefined {
  return charts.find((c) => c.id === id);
}

/* --------------------- ready-made feeds for the home --------------------- */

export const staffPicks: Chart[] = charts
  .filter((c) => c.staff_pick)
  .sort((a, b) => decayScore(b) - decayScore(a));

export const trending: Chart[] = queryCharts({ sort_by: "decaying_likes", limit: 8 }).data;
export const newest: Chart[] = queryCharts({ sort_by: "created_at", limit: 8 }).data;
export const featuredCharts: Chart[] = staffPicks.slice(0, 5);

/** Most-used tags across the pool (for filter affordances). */
export const popularTags: string[] = (() => {
  const counts = new Map<string, number>();
  for (const c of charts) for (const t of c.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([t]) => t);
})();
