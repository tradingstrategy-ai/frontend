<script lang="ts">
	import type { PageData } from './$types';
	import fetchPosts from './fetchPosts';
	import { inview } from 'svelte-inview';
	import Spinner from 'svelte-spinner';
	import { BlogRoll, HeroBanner, Section } from '$lib/components';
	import heroImage from '$lib/assets/illustrations/newspaper-1.svg?raw';
	import SocialLinks from './SocialLinks.svelte';
	export let data: PageData;

	let { posts, page } = data;

	async function fetchNextPage() {
		page.loading = true;
		try {
			const response = await fetchPosts(page);
			posts = [...posts, ...response.posts];
			page = response.page;
		} catch (e) {
			page.error = e.message;
			page.loading = false;
		}
	}
</script>

<svelte:head>
	<title>Blog</title>
	<meta name="description" content="Latest on algorithmic trading" />
</svelte:head>

<main>
	<Section class="hero" header layout="boxed">
		<HeroBanner
			title="Trading Strategy Blog"
			subtitle="Follow our decentralised algorithmic trading protocol development"
			image={heroImage}
		>
			<SocialLinks layout="index" />
		</HeroBanner>
	</Section>

	<Section class="posts" layout="boxed" padding="md">
		<BlogRoll {posts} />
	</Section>

	<section class="loading">
		<div>
			{#if page.loading}
				<Spinner />
			{:else if page.error}
				Error loading blog posts:
				<pre class="font-weight-normal">{page.error}</pre>
			{:else if page.next}
				<div use:inview={{ rootMargin: '500px' }} on:enter={fetchNextPage} />
			{:else}
				Congratulations – you've reached the end 🎉! Check back soon for new posts.
			{/if}
		</div>
	</section>
</main>

<style lang="postcss">
	/* :global {
		& .blog-roll {
			& .content-tile:first-of-type {
				grid-column: 1 / -1;

				& .content {
					padding: var(--space-xl);
					place-content: center start;
					place-items: start;
				}

				& .title {
					font: var(--f-heading-lg-medium) !important;
				}
			}
		}
	} */

	:global {
		& .hero {
			& .social-links {
				margin-top: var(--space-sm);

				@media (--viewport-sm-down) {
					margin: var(--space-md) 0;
				}
			}

			@media (--viewport-sm-down) {
				& .media {
					display: none;
				}
			}
		}
	}

	.loading {
		font: var(--f-ui-large-roman);
		text-align: center;
	}
</style>
