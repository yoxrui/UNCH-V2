import { fetchCharters } from "$lib/data/index.js";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ fetch }) => ({
  charters: await fetchCharters(fetch),
});
