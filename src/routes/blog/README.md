# Ghost integration with SvelteKit

Optimised to work with server-side rendering and `adapter-node`

[See the live site](https://tradingstrategy.ai/blog).

- Designed so that your Ghost hosted instance can be password protected and not picked up by search engine
- Blog roll page
- [Blog post page](./[slug]/+page.svelte)
- [RSS](./rss.xml/+server.ts)
- Sitemap for Google Search Console
- SEO with HTML meta tags
- [Social media tags for Facebook, Twitter](./SocialMetaTags.svelte) 
- [Special HTML manipulation techniques to clean up Ghost HTML output](./BlogPostContent.svelte)
- [Proxy images locally](./image/server.ts) to make Twitter card preview images work correctly

## Ghost Content API based

Uses Ghost JavaScript client

```typescrt
import GhostContentAPI from '@tryghost/content-api';
```