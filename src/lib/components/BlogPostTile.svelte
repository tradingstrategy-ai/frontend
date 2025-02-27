<!--
@component
Display a blog post tile - e.g., on main blog roll or home page preview

@example

```svelte
	<BlogPostTile {post} />
```
 -->
<script lang="ts">
	import type { BlogPostIndexItem } from '$lib/schemas/blog';
	import Button from '$lib/components/Button.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';

	type Props = {
		post: BlogPostIndexItem;
	};

	let { post }: Props = $props();
</script>

<a class="blog-post-tile tile a" href="/blog/{post.slug}">
	<img src={post.feature_image} alt={post.feature_image_alt ?? 'Blog post image'} />

	<div class="content">
		<div class="info">
			<Timestamp date={post.published_at} let:parsedDate let:relative>
				{parsedDate?.toDateString()}, {relative}
			</Timestamp>

			<h3 class="truncate lines-3">{post.title}</h3>

			<p class="truncate lines-3">{post.excerpt}</p>
		</div>

		<div class="cta">
			<Button label="Read article" />
		</div>
	</div>
</a>

<style>
	.blog-post-tile {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(19rem, 1fr));
		grid-auto-rows: auto 1fr;
		overflow: hidden;
		place-content: stretch;
	}

	img {
		width: 100%;
		height: 100%;
		aspect-ratio: 1;
		object-fit: cover;
		background: var(--c-box-2);

		@media (--viewport-sm-up) {
			max-height: 20rem;
		}

		@media (--viewport-xs) {
			height: min(16rem, 28vh);
		}
	}

	.content {
		--content-gap: var(--space-sl);
		--content-padding: var(--space-ll) var(--space-lg);

		@media (--viewport-sm-down) {
			--content-gap: var(--space-ss);
			--content-padding: var(--space-ls) var(--space-ml);
		}

		display: grid;
		gap: var(--content-gap);
		padding: var(--content-padding);
		place-content: space-between center;
	}

	.info {
		display: grid;
		gap: var(--content-gap);

		:global time {
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--f-ui-sm-spacing, normal);
			color: var(--c-text-extra-light);
		}

		h3 {
			margin: 0;
			font: var(--f-heading-md-medium);
			letter-spacing: var(--f-heading-md-spacing, normal);
		}

		p {
			font: var(--f-ui-md-roman);
			letter-spacing: var(--f-ui-md-spacing, normal);
			color: var(--c-text-light);
		}
	}

	.cta {
		margin-top: var(--space-sm);
		display: grid;
	}
</style>
