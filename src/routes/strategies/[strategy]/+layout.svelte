<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Alert, PageHeading } from '$lib/components';
	import { menuOptions, default as StrategyNav } from './StrategyNav.svelte';
	import StrategyBadges from '../StrategyBadges.svelte';
	import { WalletWidget } from '$lib/wallet';
	import { getTradeExecutorErrorHtml } from 'trade-executor/strategy/error';

	export let data;

	$: ({ strategy, deferred } = data);

	// Get the error message HTML
	$: errorHtml = getTradeExecutorErrorHtml(strategy);

	$: breadcrumbs = {
		[strategy.id]: strategy.name,
		...Object.fromEntries(menuOptions.map(({ slug, label }) => [slug, label])),
		...$page.data.breadcrumbs
	};
</script>

<Breadcrumbs labels={breadcrumbs} />

<main class="strategy-layout ds-container ds-3">
	{#if $page.data.skipSideNav}
		<slot />
	{:else}
		<PageHeading description={strategy.short_description}>
			<object slot="icon" type="image/webp" data="/avatars/{strategy.id}.webp" aria-label="Strategy icon">
				<img src={strategy.icon_url} alt="Strategy icon" />
			</object>
			<div class="title" slot="title">
				{strategy.name}
				<StrategyBadges class="badge" tags={strategy.tags} />
			</div>
			<div class="wallet-widget" slot="cta">
				<WalletWidget {strategy} />
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
				basePath="/strategies/{strategy.id}"
				currentPath={$page.url.pathname}
				hasEnzymeVault={strategy.on_chain_data.asset_management_mode === 'enzyme'}
				backtestAvailable={strategy.backtest_available}
				portfolioPromise={deferred.state.then((s) => s?.portfolio)}
			/>
			<slot />
		</div>
	{/if}
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
