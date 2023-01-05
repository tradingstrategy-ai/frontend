<script lang="ts">
	import type { Blog } from '$lib/types';
	import { ContentTile } from '$lib/components';

	export let limit: null | number = null;
	export let posts: Array<Blog.BlogPost>;

	$: listedPosts = limit ? posts.slice(0, limit) : posts;
</script>

<div class="blog-roll" data-testid="blog-roll">
	{#each listedPosts as post, idx (post.id)}
		<ContentTile
			ctaLabel="Read article"
			href="/blog/{post.slug}"
			mediaSrc={post.feature_image}
			mediaAlt={post.feature_image_alt}
			title={post.title}
			datetime={new Date(post.published_at)}
			description={post.excerpt}
		/>
	{:else}
		<p>No blog posts found (check if Ghost is properly configured)</p>
	{/each}
</div>

<style global lang="postcss">
	.blog-roll {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(21.25rem, 1fr));
		gap: var(--space-xl);
		/** ensure featured post column gap matches the layout column gap */
		--blog-post-tile--column-gap: var(--space-3xl);
	}
</style>
