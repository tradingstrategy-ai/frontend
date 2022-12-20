<script lang="ts">
	import type { LayoutData } from './$types';
	import { page } from '$app/stores';
	import { PageHeading } from '$lib/components';
	import StrategyNav from './StrategyNav.svelte';

	export let data: LayoutData;

	$: summary = data.summary;
</script>

<main class="strategy-layout ds-container">
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
		gap: var(--space-md);

		& .page-heading p {
			font: var(--f-ui-md-medium);
		}

		& .subpage :global {
			display: grid;
			gap: var(--space-lg);

			@media (--viewport-lg-up) {
				gap: var(--space-7xl);
				grid-template-columns: 14rem auto;
			}
		}
	}
</style>
