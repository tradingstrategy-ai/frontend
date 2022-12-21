<script lang="ts">
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';
	import { AlertItem, AlertList, PageHeading } from '$lib/components';
	import StrategyNav from './StrategyNav.svelte';

	export let data: LayoutData;

	$: summary = data.summary;
</script>

<main class="strategy-layout ds-container">
	<AlertList status="warning">
		<AlertItem title="Trade execution is currently in beta">
			We are still finishing out the interface. Data and charts might be incorrect.
		</AlertItem>
	</AlertList>
	<PageHeading>
		<h1>{summary.name}</h1>
		<p>{summary.long_description}</p>
	</PageHeading>

	<div class="subpage">
		<StrategyNav strategyId={summary.id} currentPath={$page.url.pathname} />
		<slot />
	</div>
</main>

<style lang="postcss">
	.strategy-layout {
		display: grid;
		gap: 1rem;

		& :global(.alert-list) {
			width: 100%;
			margin-bottom: 1.5rem;
		}

		& .page-heading p {
			font: var(--f-ui-md-medium);
		}

		& .subpage :global {
			display: grid;
			gap: 2rem;

			@media (--viewport-lg-up) {
				gap: 3rem;
				grid-template-columns: 14rem auto;
			}
		}
	}
</style>
