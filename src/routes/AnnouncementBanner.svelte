<!--
@component
Display a configurable annoucement banner, which may be dismissed by the user.
Announcement is configured as a runtime environment variable (see `lib/config.ts`).
Dismissed state is retained in a cookie (see `hooks.server.ts`).

@example

```svelte
	<AnnouncementBanner {...announcement} dismissedAt={announcementDismissedAt} />
```
-->
<script lang="ts" context="module">
	import { writable } from 'svelte/store';

	// use global store for dismissed flag so the state persists
	// when the component is unloaded/reloaded (e.g., entering a wizard)
	export const dismissed = writable(false);
</script>

<script lang="ts">
	import { serialize } from 'cookie';
	import { slide } from 'svelte/transition';
	import type { Announcement } from '$lib/schemas/announcement';
	import { Button } from '$lib/components';
	import IconCancel from '~icons/local/cancel';

	export let title: Announcement['title'] = undefined;
	export let description: Announcement['description'];
	export let ctaLabel: Announcement['ctaLabel'];
	export let href: Announcement['href'];
	export let publishAt: Announcement['publishAt'];
	export let expireAt: Announcement['expireAt'] = undefined;
	export let dismissedAt: Date | undefined;

	const now = new Date();
	const published = now >= publishAt;
	const expired = expireAt ? now >= expireAt : false;

	// set the initial state of the dismissed flag
	dismissed.update(($dismissed) => {
		if ($dismissed) return $dismissed; // already dismissed in current browser session
		if (dismissedAt) return dismissedAt > publishAt; // previously dismissed (cookie)
		return false;
	});

	// set cookie and dismissed flag when announcement is dismissed
	function dismiss() {
		const ts = new Date().toISOString();
		document.cookie = serialize('announcement-dismissed-at', ts, {
			path: '/',
			maxAge: 365 * 24 * 60 * 60
		});
		$dismissed = true;
	}

	// dismiss announcement if user clicks a link in the content
	function handleContentClick(e: MouseEvent) {
		if ((e.target as HTMLElement).matches('a[href]')) {
			dismiss();
		}
	}
</script>

{#if published && !expired && !$dismissed}
	<section class="announcement-banner ds-container" out:slide={{ axis: 'y', duration: 750 }}>
		<div class="content">
			{#if title}
				<strong class="title">{title}</strong>
			{/if}
			<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
			<span class="description" on:click={handleContentClick}>
				{@html description}
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
		padding-block: 1rem;
		background: var(--c-text-light);
		color: var(--c-text-inverted);
		font: var(--f-ui-md-roman);
		letter-spacing: var(--f-ui-1md-spacing);

		@media (--viewport-md-down) {
			font: var(--f-ui-sm-roman);
			letter-spacing: var(--f-ui-sm-spacing);
		}

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

		.description :global(a[href]) {
			text-decoration: underline;
			font-weight: 500;
		}

		:global(.cta) {
			background: var(--c-body);
			color: var(--c-text);
			opacity: 0.85;

			&:is(:hover, :focus) {
				opacity: 0.95;
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
