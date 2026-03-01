<script lang="ts">
	import { strategyMicrosite } from '$lib/config';
	import { page } from '$app/state';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { AlertList, DataBadge, PageHeading } from '$lib/components';
	import StrategyIcon from 'trade-executor/components/StrategyIcon.svelte';
	import {
		default as StrategyError,
		shouldDisplayError,
		adminOnlyError
	} from 'trade-executor/components/StrategyError.svelte';
	import { menuOptions, default as StrategyNav } from './StrategyNav.svelte';
	import WalletWidget from '$lib/wallet/WalletWidget.svelte';

	export let data;

	$: ({ admin, strategy, vault, deferred } = data);

	$: tags = strategy.tags.filter((tag) => tag !== 'live');
	$: isPrivate = !strategy.tags.includes('live');
	$: isOverviewPage = page.url.pathname.endsWith(strategy.id);
	$: hasError = shouldDisplayError(strategy, admin);
	$: isOutdated = Boolean(strategy.newVersionId);
	$: displayWarning = isOverviewPage && (hasError || isOutdated);

	$: breadcrumbs = {
		[strategy.id]: strategy.name,
		...Object.fromEntries(menuOptions.map(({ slug, label }) => [slug, label])),
		...page.data.breadcrumbs
	};
</script>

{#if !(strategyMicrosite || page.data.skipBreadcrumbs)}
	<Breadcrumbs labels={breadcrumbs} />
{/if}

{#if page.data.skipSideNav && !strategyMicrosite}
	<slot />
{:else}
	<main class="strategy-layout ds-container ds-3" class:microsite={strategyMicrosite}>
		<PageHeading description={strategy.short_description}>
			<svelte:fragment slot="icon">
				{#if strategyMicrosite && !isOverviewPage}
					<a href="/strategies/{strategy.id}" aria-label="Home">
						<StrategyIcon {strategy} />
					</a>
				{:else}
					<StrategyIcon {strategy} />
				{/if}
			</svelte:fragment>
			<div class="title" slot="title">
				{strategy.name}

				{#each tags as tag}
					<DataBadge class="badge" status="warning">{tag}</DataBadge>
				{/each}
			</div>
			<div class="wallet-widget" slot="cta">
				<WalletWidget {strategy} />
			</div>
		</PageHeading>

		{#if isPrivate || displayWarning}
			<div class="error-wrapper">
				{#if isPrivate}
					<AlertList status="error" size="md" let:AlertItem>
						<AlertItem title="Private strategy">
							This strategies is only available to admins – please do not share.
						</AlertItem>
					</AlertList>
				{/if}
				{#if displayWarning}
					<AlertList status="warning" size="md" let:AlertItem>
						<AlertItem title="Outdated strategy" displayWhen={isOutdated}>
							You are viewing an outdated version of this strategy. An updated version is available
							<a href="/strategies/{strategy.newVersionId}" data-sveltekit-reload>here</a>. To maximize future returns,
							participants should consider tranfering deposits to the latest version (though there is no guarantee of
							better performance).
						</AlertItem>
						<AlertItem title="Ongoing execution issues" displayWhen={hasError}>
							<StrategyError {strategy} />
							{#if adminOnlyError(strategy)}
								<p class="admin-error"><strong>Note:</strong> this error is only displayed to admin users.</p>
							{/if}
						</AlertItem>
					</AlertList>
				{/if}
			</div>
		{/if}

		{#if page.data.skipSideNav}
			{#if strategyMicrosite}
				<Breadcrumbs labels={breadcrumbs} startAt={2} />
			{/if}
			<slot />
		{:else}
			<div class="subpage">
				<StrategyNav
					basePath="/strategies/{strategy.id}"
					currentPath={page.url.pathname}
					hasVault={vault.depositEnabled()}
					backtestAvailable={strategy.backtest_available}
					portfolioPromise={deferred.state.then((s) => s?.portfolio)}
				/>
				<slot />
			</div>
		{/if}
	</main>
{/if}

<style>
	.strategy-layout {
		display: grid;
		gap: var(--space-md);

		&.microsite {
			margin-top: 1.5rem;

			@media (--viewport-xs) {
				margin-top: 1rem;
			}

			a {
				width: 100%;
			}
		}

		:global(.badge) {
			font-size: clamp(11px, 0.45em, 16px);
			margin-inline: 0.25em;
			transform: translate(0, -0.375em);
		}

		.admin-error {
			margin-top: 1rem;
			opacity: 0.5;
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
			display: grid;
			gap: 1rem;
			margin-block: -1rem 1rem;
		}
	}
</style>
