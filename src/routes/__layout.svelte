<script lang="ts">
	/**
	 * The main website layout frame.
	 */
	import Navbar from '$lib/header/Navbar.svelte';
	import AppHead from '$lib/header/AppHead.svelte';
	import SiteMode from '$lib/header/SiteMode.svelte';
	import PageLoadProgressBar from '$lib/header/PageLoadProgressBar.svelte';
	import Footer from '$lib/header/Footer.svelte';
	import { beforeNavigate } from '$app/navigation';
	import { browser } from '$app/env';

	import '../../theme/dist/css/neumorphism.css';

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
<Navbar />
<slot />
<Footer />
<SiteMode />

<style>
	:global(:root) {
		--price-up-green: #458b00;
		--price-down-red: #cc0000;
		--link-underline: #458b00;
		--badge-exchange: #458b00;
		--badge-token: #b99537;
		--badge-pair: #496abf;
	}

	/**
     * Body text helpers
    */

	:global(a.body-link) {
		border-bottom: 1px solid var(--link-underline);
	}

	:global(a.body-link:hover) {
		color: var(--link-underline);
	}

	/**
     * Price action and candle colors
     */

	:global(.price-change-green) {
		color: var(--price-up-green);
	}

	:global(.price-change-red) {
		color: var(--price-down-red);
	}

	/**
     * Entity badge colors
     */

	:global(.badge-exchange) {
		background-color: var(--badge-exchange);
	}

	:global(.badge-token) {
		background-color: var(--badge-token);
	}

	:global(.badge-pair) {
		background-color: var(--badge-pair);
	}
</style>
