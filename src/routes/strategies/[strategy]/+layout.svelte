<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { AlertList, PageHeading } from '$lib/components';
	import { StrategyIcon, StrategyError, hasError } from 'trade-executor/components';
	import { menuOptions, default as StrategyNav } from './StrategyNav.svelte';
	import StrategyBadges from '../StrategyBadges.svelte';
	import { WalletWidget } from '$lib/wallet';

	export let data;

	$: ({ strategy, deferred } = data);

	$: isOverviewPage = $page.url.pathname.endsWith(strategy.id);

	$: isOutdated = Boolean(strategy.new_version_id);

	$: breadcrumbs = {
		[strategy.id]: strategy.name,
		...Object.fromEntries(menuOptions.map(({ slug, label }) => [slug, label])),
		...$page.data.breadcrumbs
	};
</script>

<Breadcrumbs labels={breadcrumbs} />

{#if $page.data.skipSideNav}
	<slot />
{:else}
	<main class="strategy-layout ds-container ds-3">
		<PageHeading description={strategy.short_description}>
			<StrategyIcon slot="icon" {strategy} />
			<div class="title" slot="title">
				{strategy.name}
				<StrategyBadges class="badge" tags={strategy.tags} />
			</div>
			<div class="wallet-widget" slot="cta">
				<WalletWidget {strategy} />
			</div>
		</PageHeading>

		{#if isOverviewPage && (hasError(strategy) || isOutdated)}
			<div class="error-wrapper">
				<AlertList status="warning" size="md" let:AlertItem>
					<AlertItem title="Outdated strategy" displayWhen={isOutdated}>
						You are viewing an outdated version of this strategy. An updated version is available
						<a href="/strategies/{strategy.new_version_id}" data-sveltekit-reload>here</a>. To maximize future returns,
						participants should consider tranfering deposits to the latest version (though there is no guarantee of
						better performance).
					</AlertItem>
					<AlertItem title="Ongoing execution issues" displayWhen={hasError(strategy)}>
						<StrategyError {strategy} />
					</AlertItem>
				</AlertList>
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
	</main>
{/if}

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
