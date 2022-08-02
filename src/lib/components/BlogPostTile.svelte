<script lang="ts">
	import BlogPostTimestamp from './BlogPostTimestamp.svelte';

	export let featured = false;
	export let slug: string;
	export let title: string;
	export let excerpt: string;
	export let imageUrl: string;
	export let imageAltText: string;
	export let publishedAt: string;
</script>

<a class:featured href={`/blog/${slug}`}>
	<img src={imageUrl} alt={imageAltText} />

	<div class="info">
		<h3>{title}</h3>
		<BlogPostTimestamp {publishedAt} />
		<p>{excerpt}</p>
	</div>
</a>

<style>
	a {
		display: grid;
		grid-template-rows: auto 1fr;
		row-gap: 1rem;
		align-items: start;
		text-decoration: none;
		--transition-duration: 0.25s;
	}

	img {
		width: 100%;
		aspect-ratio: 7 / 4;
		object-fit: cover;
		transition: opacity var(--transition-duration);
	}

	a:hover img {
		opacity: 0.9;
	}

	.info {
		display: grid;
		gap: 0.75rem;
	}

	h3 {
		font: var(--f-h2-medium);
		text-decoration: underline transparent;
		transition: text-decoration-color var(--transition-duration);
	}

	a:hover h3 {
		text-decoration-color: inherit;
	}

	p {
		font: var(--f-text-body-regular);
	}

	/* Desktop overrides */
	@media (--viewport-lg-up) {
		img {
			aspect-ratio: 5 / 3;
		}

		.info {
			gap: 1.25rem;
		}

		a.featured {
			/* Span across container's columns */
			grid-column: 1 / -1;
			/* Use horizontal layout (image left, info right) */
			grid-template-columns: 1fr 1fr;
			grid-template-rows: auto;
			/* Set --blog-post-tile--column-gap to control the column gap */
			column-gap: var(--blog-post-tile--column-gap, min(2.5rem, 3vw));
			align-items: center;
			--timestamp-font: 400 var(--fs-ui-xl);
		}

		.featured img {
			aspect-ratio: 7 / 6;
		}

		.featured .info {
			gap: 0.75rem;
		}

		.featured h3 {
			font: var(--f-h1-medium);
		}
	}
</style>
