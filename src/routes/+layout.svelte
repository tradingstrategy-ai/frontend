<!--
	Root layout
-->
<script lang="ts">
	import AppHead from '$lib/header/AppHead.svelte';
	import PageLoadProgressBar from '$lib/header/PageLoadProgressBar.svelte';
	import Navbar from '$lib/header/Navbar.svelte';
	import SiteMode from '$lib/header/SiteMode.svelte';
	import { Alert, Footer, Section } from '$lib/components';
	import { beforeNavigate } from '$app/navigation';
	import { browser } from '$app/environment';
	import { page } from '$app/stores';
	import '$lib/components/css/index.css';

	/**
	 * Lazily load fonts as per issue 9.
	 *
	 * See also app.html for <body> <script> handle.
	 *
	 * - https://github.com/tradingstrategy-ai/design-system/issues/9
	 * - https://kit.svelte.dev/docs/modules#$app-navigation-beforenavigation
	 *
	 * To test this set `fontWarmup` to `false` in dev console:
	 *
	 * ```javascript
	 * window.localStorage.setItem("fontWarmup", "false");
	 * ```
	 */
	function toggleFontLoad() {
		if (browser) {
			const fontStylesheet = document.getElementById('font-stylesheet');
			if (fontStylesheet) {
				fontStylesheet.setAttribute('rel', 'stylesheet');
			}
		}
	}

	beforeNavigate((navigation) => {
		toggleFontLoad();
	});
</script>

<AppHead />
<PageLoadProgressBar />
{#if !$page.data.skipNavbar}
	<Navbar />
{/if}
<Section padding="sm">
	<Alert status="warning">
		We are currently migrating Trading Strategy database. Data might be unavailable for a while. Please
		<a href="https://discord.gg/en8tW6MDtw" target="_blank" rel="noreferrer">join Discord</a>
		for updates.
	</Alert>
</Section>

<slot />
{#if !$page.data.skipFooter}
	<Footer />
{/if}
<SiteMode />

<style global lang="postcss">
	a.body-link {
		border-bottom: 1px solid currentColor;
		font-weight: 500;
	}

	/* Price action and candle colors */
	.bullish {
		color: hsla(var(--hsl-bullish));
	}

	.bearish {
		color: hsla(var(--hsl-bearish));
	}

	/* global skeleton class */
	.skeleton {
		color: transparent !important;
		position: relative;

		&::before {
			width: var(--skeleton-width, 100%);
			height: var(--skeleton-height, 100%);
			top: calc((100% - var(--skeleton-height)) / 2);

			content: '';
			position: absolute;
			border-radius: 2px;
			background: linear-gradient(
				to right,
				var(--c-background-2-v1) 0%,
				transparent 50%,
				var(--c-background-2-v1) 100%
			);
			background-size: 200%;
			animation: infinite 1.5s skeleton linear;
		}
	}

	@keyframes skeleton {
		from {
			background-position: 100%;
		}

		to {
			background-position: -100%;
		}
	}
</style>
