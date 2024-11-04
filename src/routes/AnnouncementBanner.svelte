<script lang="ts">
	import type { Announcement } from '$lib/schemas/announcement';
	import { Button } from '$lib/components';
	import IconCancel from '~icons/local/cancel';

	export let title: Announcement['title'];
	export let description: Announcement['description'];
	export let ctaLabel: Announcement['ctaLabel'];
	export let href: Announcement['href'];
	export let publishedAt: Announcement['publishedAt'];

	export let dismissedAt: Date | undefined;
</script>

{#if publishedAt && (!dismissedAt || dismissedAt < publishedAt)}
	<section class="announcement-banner ds-container">
		<div class="content">
			{#if title}
				<strong class="title">{title}</strong>
			{/if}
			<span class="description">
				{description}
			</span>
		</div>

		<Button class="cta" quarternary size="xs" label={ctaLabel} {href} />

		<Button class="cancel" ghost title="Dismiss announcement">
			<IconCancel slot="icon" --icon-size="1rem" />
		</Button>
	</section>
{/if}

<style>
	.announcement-banner {
		display: grid;
		padding-block: 1.25rem;
		background: var(--c-text-light);
		color: var(--c-text-inverted);
		font: var(--f-paragraph-md-roman);
		letter-spacing: var(--ls-paragraph-md);

		/* desktop layout */
		@media (--viewport-md-up) {
			grid-template-columns: 1fr auto auto;
			gap: 0.875rem;
			align-items: center;

			.title:after {
				content: ':';
			}
		}

		/* mobile layout */
		@media (--viewport-sm-down) {
			grid-template-columns: 1fr auto;
			gap: 0.25rem;
			align-items: start;

			/* elevate title and description into the main grid */
			.content {
				display: contents;
			}

			.description {
				grid-area: 2 / 1 / auto / -1;
			}

			/* move cancel button to upper-right corner */
			:global(.cancel) {
				grid-area: 1 / 2;
			}

			/* move cta button to bottom row (full width) */
			:global(.cta) {
				grid-area: 3 / 1 / auto / -1;
				margin-top: 0.5rem;
			}
		}

		:global(.cancel .icon path) {
			transition: var(--transition-1);
			stroke-width: 2.5;
		}

		:global(.cancel:is(:hover, :focus) .icon path) {
			stroke-width: 3;
		}
	}
</style>
