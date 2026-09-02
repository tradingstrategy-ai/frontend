<!--
@component
Display the site-wide podcast announcement, which may be dismissed by the user.
Dismissed state is retained in a podcast-specific cookie (see `hooks.server.ts`).

@example

```svelte
	<AnnouncementBanner dismissedAt={podcastAnnouncementDismissedAt} />
```
-->
<script lang="ts" context="module">
	import { writable } from 'svelte/store';

	// use global store for dismissed flag so the state persists
	// when the component is unloaded/reloaded (e.g., entering a wizard)
	export const dismissed = writable(false);
</script>

<script lang="ts">
	import { resolve } from '$app/paths';
	import { serialize } from 'cookie';
	import { slide } from 'svelte/transition';
	import { Button } from '$lib/components';
	import IconCancel from '~icons/local/cancel';

	export let dismissedAt: Date | undefined;

	// set the initial state of the dismissed flag
	dismissed.update(($dismissed) => {
		if ($dismissed) return $dismissed; // already dismissed in current browser session
		return Boolean(dismissedAt); // previously dismissed (cookie)
	});

	// set cookie and dismissed flag when announcement is dismissed
	function dismiss() {
		const ts = new Date().toISOString();
		document.cookie = serialize('podcast-announcement-dismissed-at', ts, {
			path: '/',
			maxAge: 365 * 24 * 60 * 60
		});
		$dismissed = true;
	}
</script>

{#if !$dismissed}
	<section class="announcement-banner ds-container" out:slide={{ axis: 'y', duration: 750 }}>
		<div class="content">
			<span class="description">
				We have started the Trading Strategy podcast.
				<a href={resolve('/podcast')} on:click={dismiss}>Listen to us on Youtube and Spotify.</a>
			</span>
		</div>

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
			grid-template-columns: 1fr auto;
			gap: 0.875rem;
			align-items: center;
		}

		/* mobile layout */
		@media (--viewport-sm-down) {
			grid-template-columns: 1fr auto;
			gap: 0.25rem;
			align-items: start;

			.content {
				grid-column: 1;
			}

			/* move cancel button to upper-right corner */
			:global(.cancel) {
				grid-area: 1 / 2;
			}
		}

		.description :global(a[href]) {
			text-decoration: underline;
			font-weight: 500;
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
