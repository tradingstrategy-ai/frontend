import type { PageLoad } from "../$types";
import { backendUrl } from '$lib/config';

export const load = (async () => {

  const pairsReq = await fetch(`${backendUrl}/pairs`);
  
  const pairs = await pairsReq.json();

  return {
    pairs,
  }
}) satisfies PageLoad;