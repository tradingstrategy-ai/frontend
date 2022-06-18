<!--
@component
Display a blog post preview card (e.g, on home page or blog index).

#### Usage:
```tsx
<BlogPreviewCard {post} layout="compact|full" />
```
-->
<script lang="ts">
	import RelativeDate from '$lib/blog/RelativeDate.svelte';

	export let post;
	export let layout: 'compact' | 'full';
</script>

<div class="card bg-primary border-light shadow-soft {layout}">
	{#if post.feature_image}
		<a href={`/blog/${post.slug}`}>
			<img class="card-img-top rounded-top" src={post.feature_image} alt={post.feature_image_alt} />
		</a>
	{/if}

	<div class="card-body">
		<h5 class="card-title">
			<a href={`/blog/${post.slug}`}>{post.title}</a>
		</h5>

		<p class="text-published text-muted text-sm">
			{#if layout === 'full'}
				{new Date(post.published_at).toDateString()}
				Published:
			{/if}
			<RelativeDate timestamp={post.published_at} />
		</p>

		<p class="card-text body-text">
			{post.excerpt}
		</p>
	</div>

	<div class="card-footer text-right pt-0">
		<a class="btn btn-primary btn-read" href={`/blog/${post.slug}`}>Read post</a>
	</div>
</div>

<style>
	.compact {
		margin-bottom: 20px;
	}

	.full {
		margin-bottom: 60px;
	}

	.card-img-top {
		object-fit: cover;
	}

	.full .card-img-top {
		max-height: 220px;
	}

	.compact .card-img-top {
		aspect-ratio: calc(1920 / 820);
	}

	@media (max-width: 992px) {
		.compact .card-img-top {
			aspect-ratio: calc(18 / 7);
		}
	}

	.text-published {
		font-size: 70%;
		text-transform: uppercase;
	}
</style>
