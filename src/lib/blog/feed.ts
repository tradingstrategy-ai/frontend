import ghostClient from "$lib/blog/client";
import type { Json } from "$lib/types";

export async function fetchBlogroll(limit = 5): Promise<Json[]> {
  // See post data model
  // https://ghost.org/docs/content-api/#posts
  return await ghostClient?.posts.browse({ limit });
}
