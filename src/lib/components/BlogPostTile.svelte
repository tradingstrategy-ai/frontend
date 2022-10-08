<!--
@component
Display a blog post preview card (e.g, on home page or blog index).

#### Usage:
```tsx
	<BlogPostTile
		featured={false}
		slug="blog-post-slug"
		title="Blog Post Title"
		excerpt="Lorem ipsum dolor sit amet, consectetur adipiscing elit."
		imageUrl="https://some.image.url/abc123"
		imageAltText="beautiful blog image"
		publishedAt="2022-01-01T12:00:00Z"
	/>
```
-->
<script lang="ts">
	import { BlogPostTimestamp } from '$lib/components';

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

	<div>
		<h3>{title}</h3>
		<BlogPostTimestamp {publishedAt} />
		<p>{excerpt}</p>
	</div>
</a>

<style lang="postcss">
	a {
		display: grid;
		grid-template-rows: auto 1fr;
		row-gap: 1rem;
		align-items: start;
		text-decoration: none;
		pointer-events: none;
		--transition-duration: 0.25s;
	}

	a > * {
		pointer-events: all;
	}

	img {
		width: 100%;
		aspect-ratio: 8 / 5;
		object-fit: cover;
		transition: opacity var(--transition-duration);

		@media (--viewport-md-down) {
			aspect-ratio: 9 / 5;
		}

		@nest a:hover & {
			opacity: 0.9;
		}
	}

	div {
		display: grid;
		gap: 1.25rem;

		@media (--viewport-md-down) {
			gap: 0.75rem;
		}
	}

	h3 {
		font: var(--f-h2-medium);
		text-transform: capitalize;
		text-decoration: underline;
		text-decoration-color: transparent;
		transition: text-decoration-color var(--transition-duration);

		@nest a:hover & {
			text-decoration-color: inherit;
		}
	}

	p {
		font: var(--f-text-body-regular);
		color: var(--c-text-4);

		@media (--viewport-md-down) {
			font: var(--f-text-small-regular);
		}
	}

	/* Desktop featured post overrides */
	@media (--viewport-lg-up) {
		a.featured {
			/* Span across container's columns */
			grid-column: 1 / -1;
			/* Use horizontal layout (image left, info right) */
			grid-template-columns: 1fr 1fr;
			grid-template-rows: auto;
			/* Set --blog-post-tile--column-gap to control the column gap */
			column-gap: var(--blog-post-tile--column-gap, 2.5rem);
			align-items: center;
			--timestamp-font: 400 var(--fs-ui-xl);

			& img {
				aspect-ratio: 8 / 7;
			}

			& div {
				gap: 0.75rem;
			}

			& h3 {
				font: var(--f-h1-medium);
			}
		}
	}
</style>
