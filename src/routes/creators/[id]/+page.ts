import { error } from "@sveltejs/kit";
import { getAccount } from "$lib/data/index.js";
import type { PageLoad } from "./$types";

export const load: PageLoad = ({ params }) => {
  const result = getAccount(params.id);
  if (!result) error(404, "That charter doesn't exist.");
  return result;
};
