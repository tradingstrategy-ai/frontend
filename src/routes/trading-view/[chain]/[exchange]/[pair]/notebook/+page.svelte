<script lang="ts">
	import type { PageData } from './$types';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import Notebook from '$lib/components/Notebook.svelte';

	export let data: PageData;

	$: summary = data.summary;

	$: breadcrumbs = {
		[summary.exchange_slug]: summary.exchange_name,
		[summary.pair_slug]: summary.pair_name,
		notebook: 'Notebook'
	};
</script>

<Breadcrumbs labels={breadcrumbs} />

<main>
	<header class="ds-container">
		<h1>{summary.pair_symbol} token pair notebook</h1>
	</header>

	<section class="ds-container">
		<Notebook
			src="/trading-view/{summary.chain_slug}/{summary.exchange_slug}/{summary.pair_slug}/notebook/{summary.chain_slug}_{summary.exchange_slug}_{summary.pair_symbol}.ipynb"
		/>
	</section>
</main>

<style>
	:global body {
		background: var(--c-body) !important;
	}

	main {
		display: grid;
		gap: 1rem;
	}

	header h1 {
		font: var(--f-h2-medium);
	}
</style>
