<!--
@component
Social metadata with a guaranteed absolute preview image for Twitter/X,
Facebook, LinkedIn, Telegram, and other Open Graph consumers.

@example

```svelte
<SocialCardMetaTags title="Vaults" image="/social-card/trading-strategy" />
```
-->
<script lang="ts">
	import { page } from '$app/state';
	import { TRADING_STRATEGY_SOCIAL_IMAGE_PATH } from '$lib/social-card/helpers';
	import { MetaTags, type MetaTagsProps } from 'svelte-meta-tags';

	interface Props extends Partial<MetaTagsProps> {
		image?: string | null;
		imageAlt?: string;
	}

	let { image, imageAlt, openGraph, twitter, ...metaTags }: Props = $props();

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
		imageAlt ?? suppliedOpenGraphImage?.alt ?? twitter?.imageAlt ?? metaTags.title ?? 'Trading Strategy'
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
	openGraph={{ ...openGraph, images: [openGraphImage] }}
	twitter={{
		...twitter,
		cardType: isGeneratedSocialCard ? 'summary_large_image' : (twitter?.cardType ?? 'summary_large_image'),
		image: selectedImageUrl,
		imageAlt: selectedImageAlt
	}}
/>
