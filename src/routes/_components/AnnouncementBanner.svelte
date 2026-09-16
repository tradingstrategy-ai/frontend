<!--
@component
Display the site-wide podcast announcement, which may be dismissed by the user.
Dismissed state is retained in a podcast-specific cookie (see `hooks.server.ts`).

The root layout renders it on non-home pages. It is hidden below the small-screen breakpoint.
The server derives its state from the cookie, while the client retains a dismissal during
client-side navigation.

@example

```svelte
	<AnnouncementBanner dismissedAt={podcastAnnouncementDismissedAt} />
```
-->
<script lang="ts" module>
	// Updated only by the browser's dismissal handler.
	let dismissedInSession = $state(false);
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
	import { serialize } from 'cookie';
	import { slide } from 'svelte/transition';
	import { Button } from '$lib/components';
	import IconCancel from '~icons/local/cancel';
	import IconPodcast from '~icons/local/podcast';

	let { dismissedAt }: { dismissedAt: Date | undefined } = $props();

	let dismissed = $derived(dismissedInSession || Boolean(dismissedAt));

	// Persist the dismissal and retain it through client-side navigation.
	function dismiss() {
		const ts = new Date().toISOString();
		document.cookie = serialize('podcast-announcement-dismissed-at', ts, {
			path: '/',
			maxAge: 365 * 24 * 60 * 60
		});
		dismissedInSession = true;
	}
</script>

{#if !dismissed}
	<section class="announcement-banner ds-container" out:slide={{ axis: 'y', duration: 300 }}>
		<div class="content">
			<span class="podcast-icon" aria-hidden="true"><IconPodcast /></span>
			<span class="description">
				We have started the Trading Strategy podcast.
				<a href={resolve('/podcast')} onclick={dismiss}>Listen to us on YouTube and Spotify.</a>
			</span>
		</div>

		<Button class="cancel" ghost title="Dismiss announcement" on:click={dismiss}>
			<IconCancel slot="icon" />
		</Button>
	</section>
{/if}

<style>
	.announcement-banner {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.875rem;
		align-items: center;
		padding-block: 1rem;
		background: linear-gradient(
			105deg,
			color-mix(in srgb, var(--c-bullish) 56%, var(--c-body)),
			color-mix(in srgb, var(--c-bullish) 40%, var(--c-body))
		);
		border-bottom: 1px solid color-mix(in srgb, var(--c-bullish) 60%, var(--c-box-4));
		box-shadow: 0 0.5rem 1.25rem color-mix(in srgb, var(--c-bullish), transparent 88%);
		color: var(--c-text);
		font: var(--f-ui-md-roman);
		letter-spacing: var(--f-ui-1md-spacing);

		@media (--viewport-md-down) {
			font: var(--f-ui-sm-roman);
			letter-spacing: var(--f-ui-sm-spacing);
		}

		/* Keep mobile navigation and page content unobstructed. */
		@media (--viewport-sm-down) {
			display: none;
		}

		.description,
		.description :global(a[href]) {
			color: inherit;
		}

		.description :global(a[href]) {
			text-decoration: underline;
			text-decoration-thickness: 1px;
			text-underline-offset: 0.15em;
			font-weight: 500;
		}

		.content {
			display: flex;
			gap: var(--space-sm);
			align-items: center;
		}

		.podcast-icon {
			display: grid;
			flex: 0 0 auto;
			width: 1.25rem;
			height: 1.25rem;

			:global(.icon) {
				width: 100%;
				height: 100%;
			}
		}

		:global(.cancel) {
			display: grid;
			place-items: center;
			width: 2rem;
			height: 2rem;
			padding: 0.25rem;
			border-radius: var(--radius-md);
			--icon-size: 1rem;

			&:is(:hover, :focus-visible) {
				background: color-mix(in srgb, var(--c-text), transparent 88%);
			}

			&:focus-visible {
				outline: 2px solid currentColor;
				outline-offset: 2px;
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
