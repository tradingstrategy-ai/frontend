<!--
  Facebook, Twitter and Google SEO tags.

  To test:
  - https://developers.facebook.com/tools/debug/
  - https://cards-dev.twitter.com/validator
 -->
<script lang="ts">
	import type { BlogPostDetails } from '$lib/blog/schemas';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import { ghostConfig } from '$lib/config';

	interface Props {
		post: BlogPostDetails;
		url: URL;
	}

	let { post, url }: Props = $props();

	let pageUrl = $derived(new URL(url.pathname, url.origin).href);
	let imageUrl = $derived(post.feature_image.replace(ghostConfig.apiUrl, new URL('/blog/image', url).href));
</script>

<MetaTags
	title={post.title}
	description={post.excerpt}
	canonical={pageUrl}
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
		'@context': 'http://schema.org',
		'@type': 'NewsArticle',
		headline: post.title,
		author: {
			'@type': 'Person',
			name: 'Trading Strategy'
		},
		datePublished: post.published_at,
		dateModified: post.updated_at
	}}
/>
