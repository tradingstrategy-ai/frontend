import {backendUrl} from "$lib/config";
import type {Json} from "$lib/types";

/**
 * Helper used to render daily up and daily down pages.
 *
 * If server cannot give us data, return `null`.
 */
export async function loadMomentumData(fetch: Function): Promise<Json>  {

    const momentumResp= await fetch(`${backendUrl}/top-momentum`);

    let topMomentum;

    if (momentumResp.ok) {
        topMomentum = await momentumResp.json();
    } else {
        // Try render the frontpage even if the backend is down
        topMomentum = null;
    }

    return topMomentum;
}
