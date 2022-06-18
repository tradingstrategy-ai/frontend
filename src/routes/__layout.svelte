<script lang="ts">
	/**
	 * The main website layout frame.
	 */
	import Navbar from '$lib/header/Navbar.svelte';
	import AppHead from '$lib/header/AppHead.svelte';
	import SiteMode from '$lib/header/SiteMode.svelte';
	import PageLoadProgressBar from '$lib/header/PageLoadProgressBar.svelte';
	import Footer from '$lib/header/Footer.svelte';

	// design-system-fonts is an optional dependency, so we use Vite's glob import
	// feature to import / fail gracefully if not installed. Must assign the returned
	// value or you get a syntax error.
	const _ = import.meta.globEager('design-system-fonts/index.css');
	import 'bootstrap-theme/css/neumorphism.css';
</script>

<AppHead />

<PageLoadProgressBar />
<Navbar />
<slot />
<Footer />
<SiteMode />

<style>
	:global(:root) {
		/**
		 * New (2022) design-system colors:
		 * - introduce here as needed for theme transition
		 * - inherit from bootstrap theme colors where possible
		 * - replace with new design-system CSS as bootstrap theme is phased out
		 */
		--c-ink: var(--default);
		--c-parchment: var(--primary);
		--c-parchment-dark: #fbeedb;
		--c-parchment-extra-dark: #d9c4a6;
		--c-gray-dark: #565661;
		--c-bullish: #22b554;
		--c-bullish-dark: #1d9b48;
		--c-bearish: #f62f2f;
		--c-bearish-dark: #dc0a0a;

		/**
		 * Old CSS color vars still used in various components
		 */
		--price-up-green: var(--c-bullish);
		--price-down-red: var(--c-bearish);
		--link-underline: var(--c-bullish-dark);
		--badge-exchange: var(--c-bullish-dark);
		--badge-token: #b99537;
		--badge-pair: #496abf;
	}

	/**
	 * Body text helpers
	 */
	/* ol li, p, ul li */
	:global(.body-text),
	:global(.body-text p),
	:global(.body-text ol li),
	:global(.body-text ul li) {
		font-family: 'Source Serif Pro', serif;
		line-height: 1.7;
	}

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
		color: var(--c-bullish-dark);
	}

	:global(.price-change-red) {
		color: var(--c-bearish-dark);
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

	/**
	 * Inline SVG icon set colors
	 */

	:global(.icons-duotone-1) {
		fill: var(--c-bullish);
	}

	:global(.icons-duotone-2) {
		fill: var(--c-bearish);
	}

	:global(.icons-duotone-1-stroke) {
		stroke: var(--c-bullish);
	}
</style>
