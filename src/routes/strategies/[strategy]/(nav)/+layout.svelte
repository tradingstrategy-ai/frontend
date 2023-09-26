<script lang="ts">
	import { page } from '$app/stores';
	import { Alert, PageHeading } from '$lib/components';
	import StrategyNav from './StrategyNav.svelte';
	import { getTradeExecutorErrorHtml } from 'trade-executor/strategy/error';

	export let data;

	$: ({ summary } = data);

	$: backtestAvailable = summary.backtest_available;
	// Get the error message HTML
	$: errorHtml = getTradeExecutorErrorHtml(summary);
</script>

<main class="strategy-layout ds-container">
	<PageHeading>
		<div class="page-heading-inner">
			<img class="avatar" src={data.strategy?.icon_url ?? `/avatars/${data.strategy.id}.jpg`} alt="" />
			<div class="content">
				<h1>{summary.name}</h1>
				<p>{summary.long_description}</p>

				{#if errorHtml}
					<div class="error-wrapper">
						<Alert status="warning" size="sm" title="Ongoing execution issues">
							{@html errorHtml}
						</Alert>
					</div>
				{/if}
			</div>
		</div>
	</PageHeading>

	<div class="subpage">
		<StrategyNav
			strategyId={summary.id}
			portfolio={data.state.portfolio}
			onChainData={summary.on_chain_data}
			currentPath={$page.url.pathname}
			{backtestAvailable}
		/>
		<div>
			<slot />
			<p class="beta-notice">
				<strong>Beta notice</strong>: Trade execution is currently in beta. Execution may contain issues.
			</p>
		</div>
	</div>
</main>

<style lang="postcss">
	.page-heading-inner {
		align-items: center;
		display: flex;
		gap: 2rem;
	}
	.avatar {
		background: hsla(var(--hsla-box-1));
		border: none;
		border-radius: 10rem;
		display: flex;
		height: 8rem;
		width: 8rem;
	}
	.strategy-layout {
		display: grid;
		gap: var(--space-md);

		:global(> .alert-list) {
			width: 100%;
			margin-top: var(--space-lg);
		}

		.page-heading p {
			font: var(--f-ui-md-roman);
		}

		.subpage :global {
			display: grid;
			gap: var(--space-ls);

			@media (--viewport-lg-up) {
				gap: var(--space-5xl);
				grid-template-columns: 14rem auto;
			}
		}
	}

	.beta-notice {
		margin: var(--space-xl) 0;
		color: hsla(var(--hsl-text-extra-light));
	}

	.error-wrapper {
		margin-top: var(--space-md);
	}
</style>
