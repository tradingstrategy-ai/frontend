<script lang="ts">
	import { page } from '$app/stores';
	import { AlertItem, AlertList, Button, Section, SummaryBox } from '$lib/components';
	import StrategyNav from './StrategyNav.svelte';

	export let data;

	$: summary = data.summary;
</script>

<div class="strategy-layout">
	<Section gap="xs">
		<header>
			<h1>{summary.name}</h1>
			<p>{summary.long_description}</p>
		</header>

		<div class="subpage">
			<StrategyNav strategyId={summary.id} portfolio={data.state.portfolio} currentPath={$page.url.pathname} />
			<slot />
		</div>
		<AlertList status="warning">
			<AlertItem title="Trade execution is currently in beta">
				We are still finishing out the interface. Data and charts might be incorrect.
			</AlertItem>
		</AlertList>
	</Section>
</div>

<style lang="postcss">
	.strategy-layout :global .section {
		display: grid;

		& h1 {
			font: var(--f-heading-lg-medium);
			margin-bottom: var(--space-md);
			@media (--viewport-sm-up) {
				font: var(--f-heading-xl-medium);
			}
		}

		& :global(> .alert-list) {
			width: 100%;
			margin-top: var(--space-lg);
		}

		& .page-heading p {
			font: var(--f-ui-md-medium);
		}

		& .subpage :global {
			display: grid;
			gap: var(--space-ls);

			@media (--viewport-lg-up) {
				gap: var(--space-2xl);
				grid-template-columns: 17rem auto;
			}
		}
	}
</style>
