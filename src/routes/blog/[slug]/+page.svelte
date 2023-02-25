<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Timestamp } from '$lib/components';
	import SocialMetaTags from '../SocialMetaTags.svelte';
	import SocialLinks from '../SocialLinks.svelte';
	import BlogPostContent from '../BlogPostContent.svelte';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import { Section } from '$lib/components';

	export let data: PageData;
</script>

<SocialMetaTags url={$page.url} post={data} />

<Breadcrumbs labels={{ [$page.params.slug]: data.title }} />

<Section article class="blog-article" layout="boxed" size="sm">
	<header>
		<SocialLinks layout="post" />
		<h1>{data.title}</h1>
		<Timestamp date={data.published_at} withRelative />
		<img src={data.feature_image} alt={data.feature_image_alt} />
	</header>

	<BlogPostContent html={data.html} />
</Section>

<Section class="newsletter" id="home-newsletter" layout="boxed" padding="md">
	<NewsletterOptInBanner />
</Section>

<style lang="postcss">
	:global .blog-article {
		& time {
			font: var(--timestamp-font, var(--f-ui-md-roman));
			color: var(--c-text-2-v1);
		}
	}
	header {
		margin: var(--space-md) 0;
		display: grid;
		gap: var(--space-ls);
		& h1 {
			font: var(--f-heading-lg-medium);

			@media (--viewport-sm-up) {
				font: var(--f-heading-xl-medium);
			}
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
