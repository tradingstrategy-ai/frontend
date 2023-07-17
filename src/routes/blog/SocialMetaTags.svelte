<!--
  Facebook, Twitter and Google SEO tags.

  To test:
  - https://developers.facebook.com/tools/debug/
  - https://cards-dev.twitter.com/validator
 -->
<script lang="ts">
	import { ghostConfig } from '$lib/config';
	import { serializePost } from '$lib/helpers/google-meta';

	export let post: any;
	export let url: URL;

	const imageUrl = post.feature_image.replace(ghostConfig.apiUrl, `${url.protocol}//tradingstrategy.ai/blog/image`);
</script>

<svelte:head>
	<title>{post.title}</title>
	<meta name="description" content={post.excerpt} />

	<!-- Google -->
	{@html serializePost(post)}

	<!-- Facebook -->
	<meta property="og:site_name" content="Trading Strategy" />
	<meta property="og:title" content={post.title} />
	<meta property="og:url" content={url.toString()} />
	<meta property="og:description" content={post.og_description || post.excerpt} />
	<!-- Use proxied image (see /blog/image route) -->
	<meta property="og:image" content={imageUrl} />
	<meta property="og:type" content="article" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:site" content="@TradingProtocol" />
	<meta name="twitter:title" content={post.title} />
	<meta name="twitter:description" content={post.twitter_description || post.excerpt} />
	<!-- Use proxied image (see /blog/image route) -->
	<meta name="twitter:image" content={imageUrl} />
</svelte:head>
