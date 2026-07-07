import { error } from "@sveltejs/kit";
import { fetchAccountByHandle } from "$lib/data/index.js";
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ params, fetch }) => {
  const result = await fetchAccountByHandle(fetch, params.id);
  if (!result) error(404, "That charter doesn't exist.");
  return result;
};
