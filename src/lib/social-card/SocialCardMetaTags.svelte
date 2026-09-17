<!--
@component
Page `<title>`, meta description, Open Graph and Twitter tags, with a guaranteed absolute
preview image for Twitter/X, Facebook, LinkedIn, Telegram and other Open Graph consumers.

- `titleParts` builds the title with the brand suffix through `getPageTitle` (most specific
  part first; parts are dropped from the end until the title fits ~60 characters). A plain
  `title` gets the suffix too unless it already ends with the site name.
- `description` is cut to ~155 characters on a word boundary.
- Open Graph `siteName`, `url` (the canonical page URL) and `title` (without the brand
  suffix) and the Twitter `site` handle are filled in unless overridden.
- The robots directive is left to `AppHead` (`page.data.robots`).

@example

```svelte
<SocialCardMetaTags titleParts={['WETH', 'Ethereum token']} description="…" />
<SocialCardMetaTags title="Vaults" image="/social-card/trading-strategy" />
```
-->
<script lang="ts">
	import { page } from '$app/state';
	import { SITE_NAME, getMetaDescription, getPageTitle } from '$lib/helpers/seo';
	import { TRADING_STRATEGY_SOCIAL_IMAGE_PATH } from '$lib/social-card/helpers';
	import { MetaTags, type MetaTagsProps } from 'svelte-meta-tags';

	interface Props extends Partial<MetaTagsProps> {
		/** Title fragments, most specific first; see `getPageTitle` */
		titleParts?: (string | null | undefined)[];
		image?: string | null;
		imageAlt?: string;
	}

	// The robots directive is emitted by `AppHead` from `page.data.robots` (only when a page
	// is noindex; absence means indexable), so the svelte-meta-tags default `index,follow`
	// tag is suppressed — otherwise a noindex page would carry two contradicting tags.
	let {
		titleParts,
		title,
		description,
		image,
		imageAlt,
		openGraph,
		twitter,
		robots = false,
		...metaTags
	}: Props = $props();

	/** Human title without the brand suffix, for social cards. */
	let plainTitle = $derived(titleParts?.find((part) => part?.trim())?.trim() ?? title);

	let pageTitle = $derived.by(() => {
		if (titleParts) return getPageTitle(titleParts);
		if (!title) return undefined;
		return title === SITE_NAME || title.endsWith(` | ${SITE_NAME}`) ? title : getPageTitle([title]);
	});

	let pageDescription = $derived(description == null ? undefined : getMetaDescription([description]));

	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);

	/** Resolve relative image paths and reject URL schemes social scrapers cannot fetch. */
	function getAbsoluteImageUrl(candidate: string | null | undefined): string {
		const fallbackUrl = new URL(TRADING_STRATEGY_SOCIAL_IMAGE_PATH, page.url.origin).href;

		if (!candidate?.trim()) return fallbackUrl;

		try {
			const url = new URL(candidate, page.url.origin);
			return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : fallbackUrl;
		} catch {
			return fallbackUrl;
		}
	}

	let suppliedOpenGraphImage = $derived(openGraph?.images?.find(({ url }) => Boolean(url?.trim())));
	let selectedImageUrl = $derived(getAbsoluteImageUrl(image ?? suppliedOpenGraphImage?.url ?? twitter?.image));
	let selectedImageAlt = $derived(
		imageAlt ?? suppliedOpenGraphImage?.alt ?? twitter?.imageAlt ?? plainTitle ?? SITE_NAME
	);
	let isGeneratedSocialCard = $derived(
		/^\/social-card\/(trading-strategy|blockchain)(?:\/|$)/.test(new URL(selectedImageUrl).pathname)
	);
	let openGraphImage = $derived({
		...suppliedOpenGraphImage,
		url: selectedImageUrl,
		alt: selectedImageAlt,
		...(isGeneratedSocialCard ? { type: 'image/png', width: 1200, height: 630 } : {})
	});
</script>

<MetaTags
	{...metaTags}
	title={pageTitle}
	description={pageDescription}
	{robots}
	openGraph={{
		siteName: SITE_NAME,
		url: pageUrl,
		title: plainTitle,
		description: pageDescription,
		type: 'website',
		...openGraph,
		images: [openGraphImage]
	}}
	twitter={{
		site: '@TradingProtocol',
		title: plainTitle,
		description: pageDescription,
		...twitter,
		cardType: isGeneratedSocialCard ? 'summary_large_image' : (twitter?.cardType ?? 'summary_large_image'),
		image: selectedImageUrl,
		imageAlt: selectedImageAlt
	}}
/>
