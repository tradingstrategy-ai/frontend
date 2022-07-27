<script context="module">
	import getGhostClient from '$lib/blog/client';

	// Pure server-side rendered page - no interactive JS
	import { buildBreadcrumbs } from '$lib/breadcrumb/builder';

	export async function load({ url, params, session }) {
		const ghostClient = getGhostClient(session.config.ghost);
		const { slug } = params;

		// See post data model
		// https://ghost.org/docs/content-api/#posts
		let post;
		try {
			post = await ghostClient.posts.read({ slug: slug }, { formats: ['html'] });
		} catch (error) {
			return {
				status: error.response?.status || 500,
				error: error.message
			};
		}

		const readableNames = {
			blog: 'Blog',
			[slug]: post.title
		};

		return {
			props: {
				post,
				breadcrumbs: buildBreadcrumbs(url.pathname, readableNames)
			}
		};
	}
</script>

<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import SocialMetaTags from './_SocialMetaTags.svelte';
	import RelativeDate from '$lib/blog/RelativeDate.svelte';
	import TableOfContents from './_TableOfContents.svelte';

	export let post;
	export let breadcrumbs;

	let contentEl;

	// https://stackoverflow.com/a/57377341/315168
	function wrapResponsive(el) {
		const wrapper = document.createElement('div');
		wrapper.className = 'table-responsive';
		el.parentNode.insertBefore(wrapper, el);
		wrapper.appendChild(el);
		console.log('Wrapped table', el);
	}

	// Make tables mobile friendly by wrapping them with the Bootstrap responsible table handling
	onMount(() => {
		// TODO: Run this on parsed HTML feed from Ghost.io, not on the live document
		contentEl.querySelectorAll('.table').forEach(function (elem) {
			wrapResponsive(elem);
		});
	});

	// Svelte action to inject Table of Contents. To include TOC in a post, add a <div> tag with id
	// #table-of-contents in Ghost
	function injectTOC(node: HTMLElement) {
		const target = node.querySelector('#table-of-contents');
		if (target) {
			const entries = node.querySelectorAll('h2');
			new TableOfContents({ target, props: { entries } });
		}
	}
</script>

<SocialMetaTags url={$page.url} {post} />

<header class="ds-container">
	<h1>{post.title}</h1>

	<time>
		{new Date(post.published_at).toDateString()}, <RelativeDate timestamp={post.published_at} />.
	</time>

	<img class="feature-image" src={post.feature_image} alt={post.feature_image_alt} />
</header>

<section class="ds-container">
	<div bind:this={contentEl} use:injectTOC class="content">
		{@html post.html}
	</div>
</section>

<style>
	.ds-container {
		--ds-container-max-width: 41rem;
		--ds-gap: 1.25rem;
	}

	header {
		margin-top: 2rem;
	}

	h1 {
		font: var(--f-h2-medium);
	}

	time {
		font: 400 var(--fs-ui-lg);
		color: var(--c-text-4);
	}

	.feature-image {
		max-width: 100%;
		aspect-ratio: 1.63;
		object-fit: cover;
	}

	.content {
		margin-top: 2rem;
	}

	.content,
	.content :global p,
	.content :global ol li,
	.content :global ul li {
		font: var(--f-text-small-regular);
	}

	.content :global p:not(:first-of-type) {
		margin-top: 1.5rem;
	}

	.content :global h2 {
		font: var(--f-text-large-semibold);
		margin: 3rem 0 1.5rem;
	}

	.content :global h3 {
		font: var(--f-text-body-semibold);
		margin: 2rem 0 1rem 0;
	}

	.content :global ol,
	.content :global ul {
		margin: 0;
		padding-left: 1.25rem;
	}

	.content :global li {
		margin-top: 0.5em;
		padding-left: 0.25rem;
	}

	.content :global a {
		text-decoration: underline;
		font-weight: 600;
	}

	.content :global strong,
	.content :global b {
		font-weight: 600;
	}

	.content :global figure {
		margin: 2.25rem 0;
	}

	.content :global figcaption {
		font: 400 var(--fs-ui-sm);
		letter-spacing: 0.02em;
		text-align: center;
		margin: 1rem 0;
	}

	.content :global figcaption a {
		font-weight: 500;
	}

	.content :global iframe {
		border: 0;
		width: 100%;
		min-height: 450px;
	}

	.content :global .kg-image-card {
		text-align: center;
	}

	.content :global .kg-image {
		width: auto;
		height: auto;
		max-width: 100%;
		display: inline-block;
	}

	.content :global pre {
		padding: 1.5rem;
		background: var(--c-ink);
		border: 2px solid var(--c-gray-extra-dark);
		border-radius: 0.375rem;
		color: var(--c-parchment);
	}

	/* JavaScript generated TOC */
	.content :global #table-of-contents {
		display: contents;
	}
</style>
