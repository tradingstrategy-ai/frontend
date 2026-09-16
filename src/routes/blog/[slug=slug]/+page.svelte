<!--
	Render a single blog post from Ghost
-->
<script lang="ts">
	import { page } from '$app/state';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Timestamp } from '$lib/components';
	import SocialMetaTags from './SocialMetaTags.svelte';
	import SocialLinks from '../SocialLinks.svelte';
	import BlogPostContent from './BlogPostContent.svelte';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import { Section } from '$lib/components';
	import { getBlogImageSrcSet } from '$lib/blog/images';

	let { data } = $props();
	let { post } = $derived(data);

	// The header image is the LCP element on blog posts. It is displayed at the article
	// column width (48rem max) with a 3:2 crop, so request that crop from the image proxy
	// instead of the original upload (often >1 MB PNG).
	const HEADER_IMAGE_WIDTH = 768;
	const HEADER_IMAGE_HEIGHT = 512;

	let headerImage = $derived(
		getBlogImageSrcSet(post.feature_image, {
			width: HEADER_IMAGE_WIDTH,
			height: HEADER_IMAGE_HEIGHT,
			quality: 60,
			version: post.updated_at
		})
	);
</script>

<SocialMetaTags url={page.url} {post} />

<Breadcrumbs labels={{ [page.params.slug!]: post.title }} />

<main class="blog-details-page">
	<Section tag="article" maxWidth="sm">
		<header>
			<SocialLinks --justify-content="space-between" />
			<h1>{post.title}</h1>
			<Timestamp date={post.published_at} relative>
				{#snippet children({ parsedDate, relativeStr })}
					{parsedDate?.toDateString()}, {relativeStr}
				{/snippet}
			</Timestamp>

			<img
				src={headerImage.src}
				srcset={headerImage.srcset}
				sizes="(max-width: 48rem) 100vw, 48rem"
				width={HEADER_IMAGE_WIDTH}
				height={HEADER_IMAGE_HEIGHT}
				fetchpriority="high"
				decoding="async"
				alt={post.feature_image_alt ?? post.title}
			/>
		</header>

		<BlogPostContent html={post.html} />
	</Section>

	<Section padding="md">
		<NewsletterOptInBanner />
	</Section>
</main>

<style>
	header {
		margin-block: var(--space-md);
		display: grid;
		gap: var(--space-ls);

		h1 {
			font: var(--f-heading-xl-medium);
			letter-spacing: var(--f-heading-xl-spacing, normal);
			margin-top: var(--space-xl);

			@media (--viewport-sm-down) {
				font: var(--f-heading-lg-medium);
				letter-spacing: var(--f-heading-lg-spacing, normal);
				margin-top: var(--space-md);
			}
		}

		:global(time) {
			font: var(--f-ui-md-medium);
			letter-spacing: var(--f-ui-md-spacing, normal);
			color: var(--c-text-extra-light);
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
