<script lang="ts">
	/**
	 * The main website layout frame.
	 */
	import Navbar from '$lib/header/Navbar.svelte';
	import AppHead from '$lib/header/AppHead.svelte';
	import SiteMode from '$lib/header/SiteMode.svelte';
	import PageLoadProgressBar from '$lib/header/PageLoadProgressBar.svelte';
	import Footer from '$lib/header/Footer.svelte';

	import '../../deps/theme/dist/css/neumorphism.css';
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

		/**
		 * New (2022) design-system colors:
		 * - introduce here as needed for theme transition
		 * - to be replaced with new design-system CSS as bootstrap theme is phased out
		 */
		--c-parchment-dark: #fbeedb;
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
