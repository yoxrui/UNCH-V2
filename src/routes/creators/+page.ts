import { allCharters } from "$lib/data/index.js";
import type { PageLoad } from "./$types";

export const load: PageLoad = () => ({ charters: allCharters() });
