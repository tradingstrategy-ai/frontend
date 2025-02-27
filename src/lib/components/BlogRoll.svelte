<!--
@component
Display a collection of blog posts is a responsive grid layout.

@example

```svelte
	<BlogRoll posts={arrayOfPosts} />
```
-->
<script lang="ts">
	import type { BlogPostIndexItem } from '$lib/schemas/blog';
	import BlogPostTile from '$lib/components/BlogPostTile.svelte';

	type Props = {
		posts: BlogPostIndexItem[];
	};

	let { posts }: Props = $props();
</script>

<div class="blog-roll" data-testid="blog-roll">
	{#each posts as post (post.id)}
		<BlogPostTile {post} />
	{:else}
		<p>No blog posts found (check if Ghost is properly configured)</p>
	{/each}
</div>

<style>
	.blog-roll {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(21.25rem, 1fr));
		gap: var(--space-xl);
	}
</style>
