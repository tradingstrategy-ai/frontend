<!--
	Root layout
-->
<script lang="ts">
	import Navbar from '$lib/header/Navbar.svelte';
	import AppHead from '$lib/header/AppHead.svelte';
	import SiteMode from '$lib/header/SiteMode.svelte';
	import PageLoadProgressBar from '$lib/header/PageLoadProgressBar.svelte';
	import Footer from '$lib/components/Footer.svelte';

	// design-system-fonts is an optional dependency, so we use Vite's glob import
	// feature to import / fail gracefully if not installed. Must assign the returned
	// value or you get a syntax error.
	const _ = import.meta.globEager('design-system-fonts/index.css');
	import 'bootstrap-theme/css/neumorphism.css';
	import '$lib/components/css/index.css';
</script>

<AppHead />

<PageLoadProgressBar />
<Navbar />
<slot />
<Footer />
<SiteMode />

<style global>
	/**
	 * Custom media declarations (via PostCSS Custom Media plugin) - enables `@media (--var-name) {}`
	 * Must be declared in __layout to ensure proper CSS load order in SSR.
	 */
	@custom-media --viewport-md-up (min-width: 768px);
	@custom-media --viewport-lg-up (min-width: 1024px);
	@custom-media --viewport-md-down (max-width: 1023.98px);
	@custom-media --viewport-sm-down (max-width: 767.98px);

	:root {
		/* Old CSS color vars still used in various components (refactor/remove) */
		--price-up-green: var(--c-bullish);
		--price-down-red: var(--c-bearish);
		--link-underline: var(--c-bullish-dark);
		--badge-exchange: var(--c-bullish-dark);
		--badge-token: #b99537;
		--badge-pair: #496abf;
	}

	a.body-link {
		border-bottom: 1px solid var(--link-underline);
	}

	a.body-link:hover {
		color: var(--link-underline);
	}

	/* Price action and candle colors */
	.price-change-green {
		color: var(--c-bullish-dark);
	}

	.price-change-red {
		color: var(--c-bearish-dark);
	}

	/* Entity badge colors */
	.badge-exchange {
		background-color: var(--badge-exchange);
	}

	.badge-token {
		background-color: var(--badge-token);
	}

	.badge-pair {
		background-color: var(--badge-pair);
	}

	/* Inline SVG icon set colors */
	.icons-duotone-1 {
		fill: var(--c-bullish);
	}

	.icons-duotone-2 {
		fill: var(--c-bearish);
	}

	.icons-duotone-1-stroke {
		stroke: var(--c-bullish);
	}
</style>
