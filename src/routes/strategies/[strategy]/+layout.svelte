<script lang="ts">
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { PageHeading } from '$lib/components';
	import StrategyNav from './StrategyNav.svelte';

	export let data: LayoutData;

	$: summary = data.summary;

	$: breadcrumbs = {
		[summary.id]: summary.name,
		'open-positions': 'Open positions'
	};
</script>

<Breadcrumbs labels={breadcrumbs} />

<main class="ds-container">
	<PageHeading>
		<h1>{summary.name}</h1>
		<p class="subtitle">{summary.long_description}</p>
	</PageHeading>

	<StrategyNav strategyId={summary.id} currentPath={$page.url.pathname} />
	<div class="subpage">
		<slot />
	</div>
</main>

<style lang="postcss">
	.subtitle {
		font: var(--f-ui-md-medium);
	}

	:global(.page-heading) {
		@media (--viewport-sm-up) {
			grid-column: 1/3;
		}
	}

	:global(.strategy-nav) {
		margin-bottom: 2rem;
	}

	main {
		display: grid;
		column-gap: 2rem;

		@media (--viewport-sm-up) {
			column-gap: 3rem;
			grid-template-columns: 12.5rem auto;
		}
	}
</style>
