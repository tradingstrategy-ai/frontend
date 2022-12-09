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

	<StrategyNav strategyId={summary.id} currentPath={$page.url.pathname} />

	<div class="subpage">
		<slot />
	</div>
</main>

<style lang="postcss">
	.strategy-layout :global {
		display: grid;
		column-gap: 2rem;

		@media (--viewport-lg-up) {
			column-gap: 3rem;
			grid-template-columns: 14rem auto;
		}

		& .page-heading {
			@media (--viewport-lg-up) {
				grid-column: 1/3;
			}

			& p {
				font: var(--f-ui-md-medium);
			}
		}

		& .strategy-nav {
			margin-bottom: 2rem;
		}
	}
</style>
