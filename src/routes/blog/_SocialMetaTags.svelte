<!--
  Facebook, Twitter and Google SEO tags.

  To test:
  - https://developers.facebook.com/tools/debug/
  - https://cards-dev.twitter.com/validator
 -->
<script lang="ts">
	import { serializePost } from '$lib/helpers/googleMeta';

	export let post;
	export let url: URL;

	const image = post.feature_image.replace(
		'https://trading-strategy.ghost.io',
		`${url.protocol}//tradingstrategy.ai/blog-img`
	);
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
	<meta property="og:image" content={post.feature_image} />
	<meta property="og:type" content="article" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:site" content="@TradingProtocol" />
	<meta name="twitter:title" content={post.title} />
	<meta name="twitter:description" content={post.twitter_description || post.excerpt} />
	<!-- See blog-img hack for Twitter -->
	<meta name="twitter:image" content={image} />
</svelte:head>
