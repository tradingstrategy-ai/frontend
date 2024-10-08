<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Timestamp } from '$lib/components';
	import SocialMetaTags from '../SocialMetaTags.svelte';
	import SocialLinks from '../SocialLinks.svelte';
	import BlogPostContent from './BlogPostContent.svelte';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import { Section } from '$lib/components';

	export let data;
	$: ({ post } = data);
</script>

<SocialMetaTags url={$page.url} {post} />

<Breadcrumbs labels={{ [$page.params.slug]: post.title }} />

<main class="blog-details-page">
	<Section tag="article" maxWidth="sm">
		<header>
			<SocialLinks --justify-content="space-between" />
			<h1>{post.title}</h1>
			<Timestamp date={post.published_at} let:parsedDate let:relative>
				{parsedDate?.toDateString()}, {relative}
			</Timestamp>

			<img src={post.feature_image} alt={post.feature_image_alt} />
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
