<script lang="ts">
	import { page } from '$app/stores';
	import { AlertItem, AlertList, PageHeading } from '$lib/components';
	import WalletWidget from '$lib/components/WalletWidget.svelte';
	import StrategyNav from './StrategyNav.svelte';

	export let data;

	$: summary = data.summary;
</script>

<main class="strategy-layout ds-container">
	<PageHeading>
		<span class="description">
			<div class="thumbnail">
				<img src="" alt="" />
			</div>
			<div class="text">
				<h1>{summary.name}</h1>
				<p>{summary.long_description}</p>
			</div>
		</span>
	</PageHeading>

	<div class="subpage">
		<StrategyNav strategyId={summary.id} portfolio={data.state.portfolio} currentPath={$page.url.pathname} />
		<slot />
	</div>
	<AlertList status="warning">
		<AlertItem title="Trade execution is currently in beta">
			We are still finishing out the interface. Data and charts might be incorrect.
		</AlertItem>
	</AlertList>
</main>

<style lang="postcss">
	.strategy-layout {
		display: grid;
		gap: var(--space-lg);

		& :global(> .alert-list) {
			width: 100%;
			margin-top: var(--space-lg);
		}

		& :global .page-heading {
			align-items: center;
			border-radius: var(--radius-lg);
			display: flex;
			justify-content: space-between;
			gap: var(--space-xl);

			& .description {
				display: grid;
				align-items: center;
				@media (--viewport-sm-down) {
					gap: var(--space-md);
					place-items: center;
				}
				@media (--viewport-sm-up) {
					gap: var(--space-xl);
					grid-auto-flow: column;
				}

				& img {
					background: hsla(var(--hsl-box), var(--a-box-c));
					border: none;
					border-radius: 100%;
					height: 6rem;
					width: 6rem;
				}

				& h1 {
					margin-bottom: var(--space-sm);
					@media (--viewport-sm-down) {
						font: var(--f-heading-md-medium);
					}
				}

				& p {
					@media (--viewport-sm-down) {
						font: var(--f-ui-sm-roman) !important;
					}
				}
			}
		}

		& .page-heading p {
			font: var(--f-ui-md-medium);
		}

		& .subpage :global {
			display: grid;
			gap: var(--space-ls);

			@media (--viewport-lg-up) {
				gap: var(--space-5xl);
				grid-template-columns: 14rem auto;
			}
		}
	}
</style>
