<!--
@component
Display a content tile that links to additional content, such as the blog tiles
on the blog roll.

@example

```svelte
	<ContentTile
		title="Content title"
		description="This is some amazing content!"
		mediaSrc="https://example.com/image"
		mediaAlt="image"
		date="2023-01-01"
		href="/blog/{post.slug}"
		ctaLabel="Read article"
	/>
```
 -->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { Button, Timestamp } from '$lib/components';

	let classes = '';
	export { classes as class };
	export let ctaLabel = '';
	export let date: ComponentProps<Timestamp>['date'];
	export let description = '';
	export let href: string;
	export let mediaSrc = '';
	export let mediaAlt: MaybeString = undefined;
	export let title = '';
</script>

<a class="content-tile tile a {classes}" {href}>
	<img src={mediaSrc} alt={mediaAlt ?? 'Blog post image'} />

	<div class="content">
		<div class="info">
			{#if date}
				<Timestamp {date} let:parsedDate let:relative>
					{parsedDate?.toDateString()}, {relative}
				</Timestamp>
			{/if}

			{#if title}
				<h3 class="truncate lines-3">{title}</h3>
			{/if}

			{#if description}
				<p class="truncate lines-3">{description}</p>
			{/if}
		</div>

		{#if $$slots.cta || ctaLabel}
			<div class="cta">
				<slot name="cta">
					<Button label={ctaLabel} />
				</slot>
			</div>
		{/if}
	</div>
</a>

<style>
	.content-tile {
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
