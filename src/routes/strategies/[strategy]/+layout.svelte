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

<main class="strategy-layout ds-container">
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
	main {
		display: grid;
		column-gap: 2rem;

		@media (--viewport-lg-up) {
			column-gap: 3rem;
			grid-template-columns: 14rem auto;
		}
	}

	.subtitle {
		font: var(--f-ui-md-medium);
	}

	.strategy-layout :global {
		& .page-heading {
			@media (--viewport-lg-up) {
				grid-column: 1/3;
			}
		}

		& .strategy-nav {
			margin-bottom: 2rem;
		}
	}
</style>
