<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Timestamp } from '$lib/components';
	import SocialMetaTags from '../SocialMetaTags.svelte';
	import SocialLinks from '../SocialLinks.svelte';
	import BlogPostContent from '../BlogPostContent.svelte';

	export let data: PageData;
</script>

<SocialMetaTags url={$page.url} post={data} />

<Breadcrumbs labels={{ [$page.params.slug]: data.title }} />

<article class="blog-article ds-container">
	<header>
		<SocialLinks layout="post" />
		<h1>{data.title}</h1>
		<Timestamp date={data.published_at} withRelative />
		<img src={data.feature_image} alt={data.feature_image_alt} />
	</header>

	<BlogPostContent html={data.html} />
</article>

<style lang="postcss">
	.blog-article {
		--container-max-width: 720px;
		gap: var(--space-xl);

		& header {
			margin: var(--space-md) 0;
			display: grid;
			gap: var(--space-ls);
			& h1 {
				font: var(--f-heading-xxl-medium);
			}
		}

		& img {
			width: 100%;
			aspect-ratio: 1.5;
			margin-top: var(--space-md);
			min-height: 312px;
			max-height: 400px;
			object-fit: cover;
		}

		& :global time {
			font: var(--timestamp-font, var(--f-ui-lg-roman));
			color: var(--c-text-2-v1);
		}
	}
</style>
