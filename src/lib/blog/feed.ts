import GhostContentAPI from '@tryghost/content-api'
import { getGhostCredentials } from "$lib/config";
import type {Json} from "$lib/types";

export async function fetchBlogroll(limit= 5): Promise<Json[]> {
    const ghostKeys = getGhostCredentials();

    const api = new GhostContentAPI({
        url: ghostKeys.apiUrl,
        key: ghostKeys.contentApiKey,
        version: "v3"
    });

    // See post data model
    // https://ghost.org/docs/content-api/#posts
    return await api.posts.browse({limit});

}