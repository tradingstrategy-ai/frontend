<script context="module">
	import ghostClient from '$lib/blog/client';

	// Pure server-side rendered page - no interactive JS
	import { buildBreadcrumbs } from '$lib/breadcrumb/builder';

	export async function load({ url, params }) {
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
	import { onMount, afterUpdate } from 'svelte';
	import Sidebar from '$lib/blog/Sidebar.svelte';
	import { slugify } from '$lib/helpers/slugify';
	import { serializePost } from '$lib/helpers/googleMeta';
	import { page } from '$app/stores';
	import { formatTimeAgo } from '$lib/helpers/formatters';
	import RelativeDate from '$lib/blog/RelativeDate.svelte';

	// TODO: Mobile menu requires hydrate
	// This will prevent any interactive JavaScript to load on blog (as there should be none)
	export const hydrate = true;

	// https://stackoverflow.com/a/57377341/315168
	function wrapResponsive(el) {
		const wrapper = document.createElement('div');
		wrapper.className = 'table-responsive';
		el.parentNode.insertBefore(wrapper, el);
		wrapper.appendChild(el);
		console.log('Wrapped table', el);
	}

	// Our blog posts contain links to /docs
	// Svelte internal router will try to intercept links in the blog posts
	// and gives 404 because docs are not Svelte pages.
	// This fixes this - and makes all links on the blog post to behave external.
	function fixLink(el) {
		el.setAttribute('rel', 'external');
	}

	/**
	 * Build table of content for the body text.
	 *
	 * The Ghost blog post must add an empty markup element
	 *
	 * <div id="table-of-content"></div>
	 *
	 * and the TOC is generated in the frontend side rendering.
	 *
	 * @param el Body text element
	 */
	function buildTableOfContent(el) {
		const document = el.ownerDocument;

		const placeHolder = el.querySelector("div[id='table-of-contents']");
		if (!placeHolder) {
			// This blog post does not ask for TOC
			return;
		}

		console.log('Building toc');

		// Wrap all h1s to <a name> and add a link to toc
		el.querySelectorAll('h2').forEach(function (h) {
			// Wrap h1
			const wrapper = document.createElement('a');
			const slug = slugify(h.innerText);
			if (!slug) {
				return;
			}
			console.log('Adding', slug, h.innerText);
			wrapper.setAttribute('name', slug);
			h.parentNode.insertBefore(wrapper, h);

			// Add TOC entry
			const tocEntry = document.createElement('a');
			tocEntry.setAttribute('href', `#${slug}`);
			tocEntry.innerText = h.innerText;
			placeHolder.appendChild(tocEntry);
		});

		const fecha = new Date();
		fecha.toISOString;
	}

	export let post;
	export let breadcrumbs;

	// Make tables mobile friendly by wrapping them with the Bootstrap responsible table handling
	onMount(() => {
		// TODO: Run this on parsed HTML feed from Ghost.io, not on the live document
		document.querySelectorAll('.body-text .table').forEach(function (elem) {
			wrapResponsive(elem);
		});

		document.querySelectorAll('.body-text a').forEach(function (elem) {
			fixLink(elem);
		});

		const bodyText = document.querySelector('.body-text');
		if (bodyText) {
			buildTableOfContent(bodyText);
		}
	});

	const canonicalUrl = $page.url;
</script>

<!-- Facebook, Twitter and Google SEO tags.

    To test:

    - https://developers.facebook.com/tools/debug/

    - https://cards-dev.twitter.com/validator
 -->
<svelte:head>
	<title>{post.title}</title>
	<meta name="description" content={post.excerpt} />

	<!-- Google -->
	{@html serializePost(post)}

	<!-- Facebook -->
	<meta property="og:site_name" content="Trading Strategy" />
	<meta property="og:title" content={post.title} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:description" content={post.og_description || post.excerpt} />
	<meta property="og:image" content={post.feature_image} />
	<meta property="og:type" content="article" />

	<!-- Twitter -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:site" content="@TradingProtocol" />
	<meta name="twitter:title" content={post.title} />
	<meta name="twitter:description" content={post.twitter_description || post.excerpt} />
	<!-- See blog-img hack for Twitter -->
	<meta
		name="twitter:image"
		content={post.feature_image.replace(
			'https://trading-strategy.ghost.io',
			$page.url.protocol + '//' + 'tradingstrategy.ai' + '/blog-img'
		)}
	/>
</svelte:head>

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

				<div class="body-text">
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

	.body-text :global(a) {
		border-bottom: 1px solid black;
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
		border: 1px solid var(--light);
		padding: 20px;
		margin-bottom: 20px;
	}

	:global(#table-of-contents a) {
		display: block;
		margin-bottom: 10px;
		border: 0;
	}
</style>
