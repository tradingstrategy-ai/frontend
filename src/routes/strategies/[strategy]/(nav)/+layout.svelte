<script lang="ts">
	import { page } from '$app/stores';
	import { Alert, PageHeading } from '$lib/components';
	import StrategyNav from './StrategyNav.svelte';
	import StrategyBadges from '../../StrategyBadges.svelte';
	import { WalletWidget } from '$lib/wallet';
	import { getTradeExecutorErrorHtml } from 'trade-executor/strategy/error';

	export let data;
	$: ({ chain, strategy, state } = data);

	$: backtestAvailable = strategy.backtest_available;
	// Get the error message HTML
	$: errorHtml = getTradeExecutorErrorHtml(strategy);
</script>

<main class="strategy-layout ds-container">
	<PageHeading description={strategy.short_description}>
		<img slot="icon" src={strategy.icon_url} alt={strategy.name} />
		<div class="title" slot="title">
			{strategy.name}
			<StrategyBadges class="badge" tags={strategy.tags} />
		</div>
		<div class="wallet-widget" slot="cta">
			<WalletWidget {strategy} {chain} />
		</div>
	</PageHeading>

	{#if errorHtml}
		<div class="error-wrapper">
			<Alert status="warning" size="sm" title="Ongoing execution issues">
				{@html errorHtml}
			</Alert>
		</div>
	{/if}

	<div class="subpage">
		<StrategyNav
			strategyId={strategy.id}
			portfolio={state.portfolio}
			onChainData={strategy.on_chain_data}
			currentPath={$page.url.pathname}
			{backtestAvailable}
		/>
		<div>
			<slot />
		</div>
	</div>
</main>

<style lang="postcss">
	.strategy-layout {
		display: grid;
		gap: var(--space-md);

		:global(.badge) {
			font-size: clamp(11px, 0.45em, 16px);
			margin-inline: 0.25em;
			transform: translate(0, -0.375em);
		}

		.subpage {
			display: grid;
			gap: var(--space-ls);

			@media (--viewport-lg-up) {
				gap: var(--space-5xl);
				grid-template-columns: 14rem auto;
			}
		}

		.wallet-widget {
			@media (--viewport-sm-down) {
				display: none;
			}
		}

		.error-wrapper {
			margin-top: -1rem;
			margin-bottom: 1rem;
		}
	}
</style>
