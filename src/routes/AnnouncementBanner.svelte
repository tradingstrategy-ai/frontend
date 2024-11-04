<script lang="ts" context="module">
	import { writable } from 'svelte/store';

	// use global store for dismissed state so the banner stays dismissed
	// even if the component is unloaded/reloaded (e.g., entering a wizard)
	const dismissed = writable(false);
</script>

<script lang="ts">
	import cookies from 'cookie';
	import { slide } from 'svelte/transition';
	import type { Announcement } from '$lib/schemas/announcement';
	import { Button } from '$lib/components';
	import IconCancel from '~icons/local/cancel';

	export let title: Announcement['title'];
	export let description: Announcement['description'];
	export let ctaLabel: Announcement['ctaLabel'];
	export let href: Announcement['href'];
	export let publishedAt: Announcement['publishedAt'];
	export let dismissedAt: Date | undefined;

	dismissed.update(($dismissed) => {
		if ($dismissed) return $dismissed; // already dismissed in current browser session
		if (dismissedAt) return dismissedAt > publishedAt; // previously dismissed (cookie)
		return false;
	});

	function dismiss() {
		const ts = new Date().toISOString();
		document.cookie = cookies.serialize('announcement-dismissed-at', ts, {
			path: '/',
			maxAge: 365 * 24 * 60 * 60
		});
		$dismissed = true;
	}
</script>

{#if !$dismissed}
	<section class="announcement-banner ds-container" out:slide={{ axis: 'y', duration: 750 }}>
		<div class="content">
			{#if title}
				<strong class="title">{title}</strong>
			{/if}
			<span class="description">
				{description}
			</span>
		</div>

		<Button class="cta" quarternary size="xs" label={ctaLabel} {href} on:click={dismiss} />

		<Button class="cancel" ghost title="Dismiss announcement" on:click={dismiss}>
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
