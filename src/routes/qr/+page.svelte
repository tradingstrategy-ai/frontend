<!--

Where the user lands on his/her mobile after scanning the QR code
on the conference rolls.

-->
<script lang="ts">
	import { ContentCardsTemplate } from '$lib/components';
	import BrandMark from '$lib/assets/brand-mark.svg?raw';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<ContentCardsTemplate
	heroImage={BrandMark}
	heroTitle="Follow Trading Strategy"
	heroSubtitle="Follow us on our socials and join the discussion."
	pageId="qr"
	pageTitle="Follow Trading Strategy"
	pageDescription="Follow us and discuss on social media"
	cols={3}
	contentCardsSections={data.contentCardsSections}
/>

<style global>
	main#qr .hero-banner svg {
		margin-bottom: var(--space-xl);
		max-height: 12rem;
		max-width: 20rem;
	}
</style>
