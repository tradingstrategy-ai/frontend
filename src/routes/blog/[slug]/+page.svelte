<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Timestamp } from '$lib/components';
	import SocialMetaTags from '../SocialMetaTags.svelte';
	import SocialLinks from '../SocialLinks.svelte';
	import BlogPostContent from '../BlogPostContent.svelte';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import { NewSection } from '$lib/components';

	export let data: PageData;
</script>

<SocialMetaTags url={$page.url} post={data} />

<Breadcrumbs labels={{ [$page.params.slug]: data.title }} />

<main class="blog-details-page">
	<NewSection tag="article" size="sm">
		<header>
			<SocialLinks --justify-content="space-between" />
			<h1>{data.title}</h1>
			<Timestamp date={data.published_at} withRelative />
			<img src={data.feature_image} alt={data.feature_image_alt} />
		</header>

		<BlogPostContent html={data.html} />
	</NewSection>

	<NewSection padding="md">
		<NewsletterOptInBanner />
	</NewSection>
</main>

<style lang="postcss">
	header {
		margin-block: var(--space-md);
		display: grid;
		gap: var(--space-ls);

		& h1 {
			font: var(--f-heading-xl-medium);
			letter-spacing: var(--f-heading-xl-spacing, normal);
			margin-top: var(--space-xl);

			@media (--viewport-sm-down) {
				font: var(--f-heading-lg-medium);
				letter-spacing: var(--f-heading-lg-spacing, normal);
				margin-top: var(--space-md);
			}
		}

		& :global(time) {
			font: var(--timestamp-font, var(--f-ui-md-roman));
			color: var(--c-text-2-v1);
		}
	}

	img {
		border-radius: var(--radius-sm);
		width: 100%;
		aspect-ratio: 1.5;
		margin-top: var(--space-md);
		min-height: 312px;
		max-height: 400px;
		object-fit: cover;
	}
</style>
