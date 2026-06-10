<!--
@component
Full-width "Latest posts" panel for vault curator detail pages.

Shows the curator's most recent post by default; any older posts are tucked
into a foldable section toggled by a "Show more" button. Posts are sourced
from the top-vaults dataset `curators` map, sorted most-recent first, and
de-duplicated by content (the same post syndicated across feeds collapses to
its latest entry).

@example

```svelte
	<CuratorRecentPosts curator={curatorInfo} />
```
-->
<script lang="ts">
	import type { Component } from 'svelte';
	import type { CuratorInfo, CuratorRecentPost } from '$lib/top-vaults/schemas';
	import { slide } from 'svelte/transition';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import Button from '$lib/components/Button.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import IconTwitter from '~icons/local/twitter';
	import IconLinkedin from '~icons/local/linkedin';
	import IconRss from '~icons/local/rss';
	import IconNewspaper from '~icons/local/newspaper';

	interface Props {
		curator: CuratorInfo;
	}

	let { curator }: Props = $props();

	let expanded = $state(false);

	// Normalise the (sometimes timezone-less) published_at into a UTC timestamp.
	function normaliseDate(value: string): string {
		return /([zZ]|[+-]\d\d:?\d\d)$/.test(value) ? value : `${value}Z`;
	}

	function toTime(value: string): number {
		const date = new Date(normaliseDate(value));
		return Number.isNaN(date.getTime()) ? 0 : date.getTime();
	}

	// Upstream feed caps each snippet at 200 characters, cutting mid-word with no ellipsis.
	const SNIPPET_CAP = 200;

	// Our own display cap when the untruncated post content is available.
	const FULL_TEXT_CAP = 400;

	// Strip t.co short URLs and collapse whitespace from feed text.
	function cleanContent(text: string | null): string {
		return (text ?? '')
			.replace(/https?:\/\/t\.co\/\S+/gi, '')
			.replace(/\s+/g, ' ')
			.trim();
	}

	// Drop the dangling partial word and any trailing punctuation, then add an ellipsis.
	function ellipsise(text: string): string {
		return `${text.replace(/\s*\S*$/, '').replace(/[\s.,;:!?-]+$/, '')}…`;
	}

	// Render the post body: tweets show their full content (short-form by nature),
	// other sources (RSS articles can run to tens of thousands of characters) are
	// capped at FULL_TEXT_CAP. Falls back to the upstream snippet, appending an
	// ellipsis when the upstream cap cut it.
	function displaySnippet(item: CuratorRecentPost): string {
		const fullText = cleanContent(item.full_text ?? null);
		if (fullText) {
			const isTweet = ['twitter', 'x'].includes(item.source_type.toLowerCase());
			if (isTweet || fullText.length <= FULL_TEXT_CAP) return fullText;
			return ellipsise(fullText.slice(0, FULL_TEXT_CAP));
		}

		const text = cleanContent(item.snippet);
		const truncated = (item.snippet ?? '').length >= SNIPPET_CAP && !/[.!?…"']$/.test(text);
		return truncated ? ellipsise(text) : text;
	}

	function sourceIcon(sourceType: string): Component {
		switch (sourceType.toLowerCase()) {
			case 'twitter':
			case 'x':
				return IconTwitter;
			case 'linkedin':
				return IconLinkedin;
			case 'rss':
				return IconRss;
			default:
				return IconNewspaper;
		}
	}

	// Content key collapses syndicated duplicates (same text via several feeds).
	function contentKey(item: CuratorRecentPost): string {
		return `${cleanContent(item.title)} ${cleanContent(item.snippet)}`.trim().toLowerCase();
	}

	let posts = $derived.by(() => {
		const sorted = [...curator.recent_posts].sort((a, b) => toTime(b.published_at) - toTime(a.published_at));
		// Sorted most-recent first, so the first occurrence of each content is the latest entry.
		const seen = new Set<string>();
		return sorted.filter((item) => {
			const key = contentKey(item);
			// Skip posts with no displayable text (e.g. a tweet that is only a t.co link)
			if (!key) return false;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});
	});
	let latest = $derived(posts[0]);
	let rest = $derived(posts.slice(1));
</script>

{#if latest}
	<div class="curator-latest-posts">
		<MetricsBox title="Latest posts from {curator.name}">
			<div class="feed">
				{@render post(latest)}

				{#if rest.length > 0}
					<Button ghost class="toggle-btn" on:click={() => (expanded = !expanded)}>
						{expanded ? 'Show less' : `Show ${rest.length} more`}
					</Button>

					{#if expanded}
						<div class="more" transition:slide>
							{#each rest as item (item.link)}
								{@render post(item)}
							{/each}
						</div>
					{/if}
				{/if}
			</div>
		</MetricsBox>
	</div>
{/if}

{#snippet post(item: CuratorRecentPost)}
	{@const Icon = sourceIcon(item.source_type)}
	{@const title = cleanContent(item.title)}
	<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
	<a class="post" href={item.link} target="_blank" rel="noreferrer">
		<span class="post-source" title={item.source_type}>
			<Icon --icon-size="1.1rem" />
		</span>
		<div class="post-body">
			{#if title}
				<span class="post-title">{title}</span>
			{/if}
			<span class="post-snippet">{displaySnippet(item)}</span>
			<Timestamp class="post-date" date={normaliseDate(item.published_at)} relative={{ strict: true }} wrap="none" />
		</div>
	</a>
{/snippet}

<style>
	.curator-latest-posts {
		font: var(--f-ui-md-roman);
		color: var(--c-text-light);

		.feed {
			display: flex;
			flex-direction: column;
			padding-block: 0.5rem;
		}

		.post {
			display: flex;
			align-items: flex-start;
			gap: 0.75rem 1rem;
			padding: 0.75rem 0;
			text-decoration: none;
			color: var(--c-text-light);
			border-bottom: 1px solid color-mix(in srgb, var(--c-box-4), transparent 35%);

			&:hover .post-title,
			&:hover .post-snippet {
				color: var(--c-text);
			}
		}

		.post-source {
			flex: none;
			display: inline-flex;
			align-items: center;
			color: var(--c-text-extra-light);
		}

		.post-body {
			display: grid;
			gap: 0.25rem;
			flex: 1;
			min-width: 0;
		}

		.post-title {
			font: var(--f-ui-md-medium);
			color: var(--c-text);
		}

		.post-snippet {
			color: var(--c-text-light);
			transition: color var(--time-sm);
		}

		:global(.post-date) {
			margin-top: 0.15rem;
			color: var(--c-text-extra-light);
			font: var(--f-ui-xs-roman);
		}

		:global(.toggle-btn) {
			align-self: flex-start;
			margin-top: 0.75rem;
			color: var(--c-text-extra-light);

			&:hover {
				color: var(--c-text);
			}
		}

		.more {
			display: grid;
		}
	}
</style>
