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
	import Sidebar from '$lib/blog/Sidebar.svelte';
	import RelativeDate from '$lib/blog/RelativeDate.svelte';
	import TableOfContents from './_TableOfContents.svelte';

	// https://stackoverflow.com/a/57377341/315168
	function wrapResponsive(el) {
		const wrapper = document.createElement('div');
		wrapper.className = 'table-responsive';
		el.parentNode.insertBefore(wrapper, el);
		wrapper.appendChild(el);
		console.log('Wrapped table', el);
	}

	export let post;
	export let breadcrumbs;

	// Make tables mobile friendly by wrapping them with the Bootstrap responsible table handling
	onMount(() => {
		// TODO: Run this on parsed HTML feed from Ghost.io, not on the live document
		document.querySelectorAll('.body-text .table').forEach(function (elem) {
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

<section class="heading" style={`background-image: url(${post.feature_image})`}>
	<div class="container">
		<div class="row">
			<div class="col-md-12">
				<!-- --->
			</div>
		</div>
	</div>
</section>

<div class="container">
	<div class="section-post">
		<div class="row">
			<div class="col-lg-9 col-md-12">
				<h1>{post.title}</h1>

				<p class="text-published text-muted text-sm">
					Published: {new Date(post.published_at).toDateString()}, <RelativeDate timestamp={post.published_at} />.
				</p>

				<div use:injectTOC class="body-text">
					{@html post.html}
				</div>
			</div>

			<div class="col-lg-3 col-md-12">
				<Sidebar />
			</div>
		</div>
	</div>
</div>

<style>
	.container-breadcrumb :global(.breadcrumb) {
		margin: 40px 0 0 0;
	}

	.heading {
		min-height: 240px;
		padding: 80px 0;
		background-size: cover;
		background-position: center center;
		background-repeat: no-repeat;
	}

	.heading h1 {
		color: white;
		text-transform: none;
		font-size: 120%;
		text-shadow: 0 0 3px black;
		text-align: center;
	}

	.section-post {
		margin: 40px 0;
	}

	.text-published {
		margin-top: 2em;
		font-size: 70%;
		text-transform: uppercase;
	}

	.body-text :global(.kg-image) {
		margin: 20px auto;
		/* Fix explicit width and height attributes on <img> in Ghost HTML export */
		width: auto;
		height: auto;
		max-width: 100%;
		display: block;
		box-shadow: 0.6px 0.6px 10.5px -1px rgba(0, 0, 0, 0.042), 0.7px 0.7px 16.2px -1px rgba(0, 0, 0, 0.06),
			0.8px 0.8px 21.3px -1px rgba(0, 0, 0, 0.078), 1px 1px 33px -1px rgba(0, 0, 0, 0.12) !important;
		border-radius: 0.55rem;
	}

	/* TODO: set text-underlline / font-weight */
	.body-text :global(a) {
		/* border-bottom: 1px solid black; */
	}

	.body-text :global(figcaption) {
		font-size: 80%;
		font-style: italic;
		font-weight: bold;
		color: #888;
		text-align: center;
		margin-bottom: 20px;
	}

	.body-text :global(iframe) {
		border: 0;
		width: 100%;
		min-height: 450px;
	}

	.body-text :global(li) {
		margin-bottom: 0.5em;
	}

	.text-published {
		font-size: 70%;
		text-transform: uppercase;
	}

	/* JavaScript generated TOC */
	:global(#table-of-contents) {
		display: contents;
	}
</style>
