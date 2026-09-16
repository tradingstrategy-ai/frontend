<!--
@component
Display the site-wide podcast announcement, which may be dismissed by the user.
Dismissed state is retained in a podcast-specific cookie (see `hooks.server.ts`).

The banner must render on the server whenever the cookie is absent: it sits above the page
content, so mounting it only after hydration shifts the whole page down (a 0.11 CLS on
phones). Only the client keeps an in-session flag, so the banner stays hidden after a
dismissal across client-side navigations (e.g. entering a wizard) without the server ever
sharing state between requests.

@example

```svelte
	<AnnouncementBanner dismissedAt={podcastAnnouncementDismissedAt} />
```
-->
<script lang="ts" module>
	// client-only session flag; never written on the server, so SSR follows the cookie alone
	let dismissedInSession = $state(false);
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
	import { serialize } from 'cookie';
	import { slide } from 'svelte/transition';
	import { Button } from '$lib/components';
	import IconCancel from '~icons/local/cancel';

	let { dismissedAt }: { dismissedAt: Date | undefined } = $props();

	let dismissed = $derived(dismissedInSession || Boolean(dismissedAt));

	// set cookie and dismissed flag when announcement is dismissed
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
			grid-template-columns: 1fr auto;
			gap: 0.875rem;
			align-items: center;
		}

		/* mobile layout: a compact single strip so the banner does not dominate the first screen */
		@media (--viewport-sm-down) {
			grid-template-columns: 1fr auto;
			gap: 0.5rem;
			align-items: center;
			padding-block: 0.375rem;
			font: var(--f-ui-xs-roman);
			letter-spacing: var(--f-ui-xs-spacing);

			.content {
				grid-column: 1;
			}

			:global(.cancel) {
				grid-area: 1 / 2;
				padding: 0.25rem;
				--icon-size: 0.875rem;
			}
		}

		.description :global(a[href]) {
			text-decoration: underline;
			font-weight: 500;
		}

		:global(.cancel) {
			--icon-size: 1rem;
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
