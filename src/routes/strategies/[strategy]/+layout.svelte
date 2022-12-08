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

	<div class="inner">
		<StrategyNav strategyId={summary.id} currentPath={$page.url.pathname} />
		<slot />
	</div>
</main>

<style lang="postcss">
	.subtitle {
		font: var(--f-ui-md-medium);
	}

	.inner {
		display: grid;
		gap: 2rem;
		@media (--viewport-lg-up) {
			gap: 4rem;
			grid-template-columns: 12.5rem auto;
		}
	}
</style>
