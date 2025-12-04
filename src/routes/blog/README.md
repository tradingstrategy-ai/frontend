# Ghost blog integration with SvelteKit

Optimised to work with server-side rendering and `adapter-node`

[See the live site](https://tradingstrategy.ai/blog).

## Features

- Designed so that your Ghost hosted instance can be password protected and not picked up by search engine
- Blog roll page
- [Blog post page](./[slug]/+page.svelte)
- [RSS](./rss.xml/+server.ts)
- Sitemap for Google Search Console
- SEO with HTML meta tags
- [Social media tags for Facebook, Twitter](./[slug=slug]/SocialMetaTags.svelte)
- [Special HTML manipulation techniques to clean up Ghost HTML output](./[slug=slug]/BlogPostContent.svelte)
- [Automatically add table of contents listing based on headings](./[slug=slug]/BlogPostContent.svelte)
- [Proxy images locally](./image/[...file]/server.ts) to make Twitter card preview images work correctly

## Ghost REST API

Uses [Ghost REST Content API](https://ghost.org/docs/content-api/)
