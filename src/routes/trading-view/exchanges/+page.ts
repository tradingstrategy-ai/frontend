import type { PageLoad } from "../$types";
import { backendUrl } from '$lib/config';

export const load = (async () => {

  const exchangesReq = await fetch(`${backendUrl}/exchanges`);
  const { exchanges } = await exchangesReq.json();

  return {
    exchanges,
  }
}) satisfies PageLoad;