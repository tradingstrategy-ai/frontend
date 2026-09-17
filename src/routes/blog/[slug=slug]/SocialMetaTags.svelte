<!--
@component
Search, Facebook and Twitter metadata plus `BlogPosting` structured data for a blog post.

- The meta description is Ghost's `meta_description` when the author set one, otherwise the
  excerpt cut to ~155 characters (Ghost excerpts are 500 characters, far past what Google shows)
- The article is published by the site's `Organization` node (`ORGANIZATION_ID`, declared on
  the home page), which is what Google's Article feature expects

To test:
- https://search.google.com/test/rich-results
- https://developers.facebook.com/tools/debug/
- https://cards-dev.twitter.com/validator

@example

```svelte
	<SocialMetaTags url={page.url} {post} />
```
-->
<script lang="ts">
	import { getBlogImageUrl } from '$lib/blog/images';
	import type { BlogPostDetails } from '$lib/blog/schemas';
	import { ORGANIZATION_ID, SITE_NAME, getMetaDescription, getPageTitle } from '$lib/helpers/seo';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';

	interface Props {
		post: BlogPostDetails;
		url: URL;
	}

	let { post, url }: Props = $props();

	let pageUrl = $derived(new URL(url.pathname, url.origin).href);
	let imageUrl = $derived(new URL(getBlogImageUrl(post.feature_image, { version: post.updated_at }), url).href);
	let title = $derived(getPageTitle([post.meta_title || post.title]));
	let description = $derived(getMetaDescription([post.meta_description, post.excerpt]));
</script>

<MetaTags
	{title}
	{description}
	openGraph={{
		siteName: 'Trading Strategy',
		url: pageUrl,
		title: post.title,
		description: post.og_description || post.excerpt,
		images: [{ url: imageUrl }],
		type: 'article'
	}}
	twitter={{
		site: '@TradingProtocol',
		cardType: 'summary',
		title: post.title,
		description: post.twitter_description || post.excerpt,
		image: imageUrl
	}}
/>

<JsonLd
	schema={{
		'@context': 'https://schema.org',
		'@type': 'BlogPosting',
		headline: post.title,
		description,
		image: [imageUrl],
		url: pageUrl,
		mainEntityOfPage: pageUrl,
		datePublished: post.published_at,
		dateModified: post.updated_at,
		author: { '@type': 'Organization', '@id': ORGANIZATION_ID, name: SITE_NAME },
		publisher: { '@type': 'Organization', '@id': ORGANIZATION_ID, name: SITE_NAME }
	}}
/>
