<script lang="ts">
	/**
	 * Table component for displaying top DeFi vaults with sorting, filtering, and infinite scroll.
	 * Used on /trading-view/vaults and chain-specific vault pages.
	 */
	import type { Chain } from '$lib/helpers/chain';
	import type { TopVaults, VaultInfo } from './schemas';
	import { inview } from 'svelte-inview';
	import { SvelteSet } from 'svelte/reactivity';
	import TargetableLink from '$lib/components/TargetableLink.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import ChainCell from './ChainCell.svelte';
	import FeesCell from './FeesCell.svelte';
	import RiskCell from './RiskCell.svelte';
	import IconChevronUp from '~icons/local/chevron-up';
	import IconChevronDown from '~icons/local/chevron-down';
	import IconClock from '~icons/local/clock';
	import { getChain } from '$lib/helpers/chain';
	import {
		formatDollar,
		formatNumber,
		formatPercent,
		formatPercentProfit,
		formatValue,
		notFilledMarker
	} from '$lib/helpers/formatters';
	import {
		DEFAULT_TVL_KEY,
		DEFAULT_TVL_THRESHOLD,
		ageFilterOptions,
		calculateTotalTvl,
		calculateTvlWeightedApy,
		getFormattedLockup,
		isBlacklisted,
		isGoodVaultStatus,
		rankVaultsBy,
		resolveVaultDetails,
		riskFilterOptions,
		tvlFilterOptions
	} from './helpers';
	import Select from '$lib/components/Select.svelte';
	import { vaultSparklinesUrl } from '$lib/config';
	import { resolve } from '$app/paths';

	const INITIAL_ROW_COUNT = 150;
	const ROW_BATCH_SIZE = 50;

	interface SortOptions {
		key: string;
		direction: 'asc' | 'desc';
		compareFn: (a: VaultInfo, b: VaultInfo) => number;
	}

	interface Props {
		topVaults: TopVaults;
		chain?: Chain;
		tvlThreshold?: number;
		tvlTriggerLabel?: string;
		tvlTooltip?: string;
		filterTvl?: boolean;
		includeBlacklisted?: boolean;
		/** Show interactive filter dropdowns (Min TVL, Min age, Max risk) */
		showFilters?: boolean;
		/** Default TVL filter key (used to initialise the dropdown when showFilters is true) */
		defaultTvlKey?: string;
		/** Default age filter index (used to initialise the dropdown when showFilters is true) */
		defaultAgeIndex?: number;
	}

	let {
		topVaults,
		chain,
		tvlThreshold = DEFAULT_TVL_THRESHOLD,
		tvlTriggerLabel,
		tvlTooltip,
		filterTvl,
		includeBlacklisted = false,
		showFilters = false,
		defaultTvlKey = DEFAULT_TVL_KEY,
		defaultAgeIndex = 0
	}: Props = $props();

	// Interactive filter state (used when showFilters is true)
	let selectedTvlKey = $state(defaultTvlKey); // intentionally captures initial prop value only
	let selectedTvlOption = $derived(tvlFilterOptions.find((o) => o.key === selectedTvlKey)!);
	let tvlDropdownOpen = $state(false);
	let selectedAgeIndex = $state(defaultAgeIndex); // intentionally captures initial prop value only
	let selectedAge = $derived(ageFilterOptions[selectedAgeIndex]);
	let selectedRiskIndex = $state(1);
	let selectedRisk = $derived(riskFilterOptions[selectedRiskIndex]);
	let riskDropdownOpen = $state(false);

	let showChainCol = $derived(!chain);

	let offsetWidth = $state<number>();

	const VOLATILITY_CAP = 9.99; // 999% in decimal form
	const VOLATILITY_CAP_LABEL = '>999%';
	const RETURN_TOOLTIP_THRESHOLD = 1; // 100% in decimal form

	const formatReturn = (v: MaybeNumber) => formatPercentProfit(v, 1);
	const formatTvl = (v: MaybeNumber) => formatDollar(v, 2);
	const formatVolatility = (v: MaybeNumber) => {
		if (v == null) return notFilledMarker;
		if (Math.abs(v) > VOLATILITY_CAP) return VOLATILITY_CAP_LABEL;
		return formatPercent(v, 1);
	};

	let filterValue = $state('');

	// filter out blacklisted vaults (unless includeBlacklisted, searching "blacklisted",
	// or the risk dropdown includes blacklisted level)
	let baseVaults = $derived.by(() => {
		if (includeBlacklisted || filterValue.startsWith('blacklist') || selectedRisk.maxValue >= 999) {
			return topVaults.vaults;
		}
		return topVaults.vaults.filter((v) => !isBlacklisted(v));
	});

	/** Resolve the effective TVL threshold for a vault, accounting for chain overrides */
	function getVaultTvlThreshold(vault: VaultInfo): number {
		if (showFilters) {
			return selectedTvlOption.chainOverrides?.[vault.chain_id] ?? selectedTvlOption.value;
		}
		return tvlThreshold;
	}

	// Get vaults hidden due to TVL threshold (only when filtering is enabled)
	let hiddenVaults = $derived.by(() => {
		if (!filterTvl && !showFilters) return [];
		return baseVaults.filter((v) => (v.current_nav ?? 0) < getVaultTvlThreshold(v));
	});

	// Count of hidden vaults
	let hiddenByTvl = $derived(hiddenVaults.length);

	// Filter vaults matching all active filters (TVL, age, risk, search)
	let filteredVaults = $derived.by(() => {
		const filterCompareStr = filterValue.trim().toLowerCase();
		return baseVaults.filter((v) => {
			const chain = getChain(v.chain_id);

			// TVL filter (prop-driven or dropdown-driven)
			if (filterTvl || showFilters) {
				if ((v.current_nav ?? 0) < getVaultTvlThreshold(v)) {
					return false;
				}
			}

			// Age filter (dropdown-driven)
			if (showFilters) {
				const years = v.years ?? 0;
				if (selectedAge.value > 0 && years < selectedAge.value) return false;
				if (selectedAge.maxAge < Infinity && years >= selectedAge.maxAge) return false;
			}

			// Risk filter (dropdown-driven) — check both min and max bounds
			if (showFilters && (selectedRisk.minValue > 0 || selectedRisk.maxValue < Infinity)) {
				const risk = v.risk_numeric ?? Infinity;
				if (risk < selectedRisk.minValue || risk > selectedRisk.maxValue) return false;
			}

			const vaultCompareStr = [
				v.chain_id,
				chain?.name ?? '',
				v.name,
				v.protocol,
				v.denomination,
				v.risk ?? '',
				v.address
			].join(' ');
			return vaultCompareStr.toLowerCase().includes(filterCompareStr);
		});
	});

	// Exclude blacklisted vaults from stats calculations; uses filteredVaults so all
	// active filters (TVL, age, risk, search) are reflected in the stats row.
	let statsVaults = $derived(filteredVaults.filter((v) => !isBlacklisted(v)));

	// Calculate total TVL from non-blacklisted, fully-filtered vaults
	let totalTvl = $derived(calculateTotalTvl(statsVaults));

	// Calculate TVL-weighted average 1M APY from non-blacklisted, fully-filtered vaults
	let avgTvlWeightedApy1M = $derived(calculateTvlWeightedApy(statsVaults));

	let sortOptions = $state<SortOptions>({
		key: 'one_month_return_ann',
		direction: 'desc',
		compareFn: rankVaultsBy(['one_month_cagr', 'one_month_cagr_net'])
	});

	// sort vaults
	let sortedVaults = $derived.by(() => {
		const sorted = filteredVaults.toSorted(sortOptions.compareFn);
		if (sortOptions.direction === 'desc') sorted.reverse();
		return sorted;
	});

	// INFINITE SCROLL:
	// - limit the displayed vaults during initial render
	// - track sortedVaults as dependency (reset to initial count when it changes)
	// - progressively increemnt maxVisibleRows on-scroll (see load-more-sentinel)
	let maxVisibleRows = $derived(sortedVaults && INITIAL_ROW_COUNT);
	let visibleVaults = $derived(sortedVaults.slice(0, maxVisibleRows));
	let hasMoreRows = $derived(maxVisibleRows < sortedVaults.length);

	// Keep track of sparklines that failed to load to display fallback
	let failedSparklines = new SvelteSet<string>();

	function stringCompare(sortBy: (v: VaultInfo) => string) {
		return (a: VaultInfo, b: VaultInfo) => {
			return sortBy(a).localeCompare(sortBy(b));
		};
	}

	function sortBy(
		key: SortOptions['key'],
		direction: SortOptions['direction'],
		compareFn: (a: VaultInfo, b: VaultInfo) => number
	) {
		if (sortOptions.key === key) {
			direction = sortOptions.direction === 'asc' ? 'desc' : 'asc';
		}
		sortOptions = { key, direction, compareFn };
	}

	/** Svelte action to close dropdown on outside clicks */
	function clickOutside(node: HTMLElement, callback: () => void) {
		function handleClick(event: MouseEvent) {
			if (!node.contains(event.target as Node)) {
				callback();
			}
		}
		document.addEventListener('click', handleClick, true);
		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}
</script>

{#snippet sortColHeader(
	label: string,
	key: string,
	direction: SortOptions['direction'],
	compareFn: SortOptions['compareFn']
)}
	<th class={key}>
		<button onclick={() => sortBy(key, direction, compareFn)}>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html label}
		</button>
		{#if sortOptions.key === key}
			{#if sortOptions.direction === 'asc'}
				<IconChevronUp />
			{:else}
				<IconChevronDown />
			{/if}
		{/if}
	</th>
{/snippet}

{#snippet netGrossCell<T = MaybeNumber>(net: T, gross: T, formatter: Formatter<T>)}
	{@const value = net ?? gross}
	{@const capped = typeof value === 'number' && Math.abs(value) > RETURN_TOOLTIP_THRESHOLD}
	{#if value === null}
		---
	{:else if capped}
		<Tooltip>
			<span class="capped-hint" slot="trigger">{formatter(value)}</span>
			<svelte:fragment slot="popup">
				<p>
					Trading vaults, like those on Hyperliquid and GRVT, are highly volatile, and their annualised short-term
					returns may not reflect the long-term performance. For these vaults, use the longer time window to compare the
					results.
				</p>
				<p>
					Another cause for abnormal short term returns is low settlement frequency, as some vaults do not report
					returns daily, one sees monthly spikes.
				</p>
			</svelte:fragment>
		</Tooltip>
	{:else if net !== null}
		{formatter(net)}
	{:else}
		<Tooltip>
			<svelte:fragment slot="trigger">
				{formatter(gross)}*
			</svelte:fragment>
			<svelte:fragment slot="popup">
				Fee information for this protocol is not yet available. The calculation is based on gross profit and fees may
				apply.
			</svelte:fragment>
		</Tooltip>
	{/if}
{/snippet}

<div class="top-vaults-table">
	<div class="table-extras">
		<div class="table-stats" data-testid="top-vaults-meta">
			<Tooltip>
				<svelte:fragment slot="trigger">{filteredVaults.length} vaults</svelte:fragment>
				<svelte:fragment slot="popup"
					>{#if hiddenByTvl > 0}
						{hiddenByTvl} vault{hiddenByTvl === 1 ? ' is' : 's are'} hidden because {hiddenByTvl === 1
							? 'it does'
							: 'they do'}
						not meet the minimum TVL threshold:
						{hiddenVaults
							.slice(0, 2)
							.map((v) => v.name)
							.join(', ')}{#if hiddenByTvl > 2}, and {hiddenByTvl - 2} more{/if}.
					{:else}
						The number of vaults listed on this page.
					{/if}</svelte:fragment
				>
			</Tooltip>
			<Tooltip>
				<svelte:fragment slot="trigger">TVL {formatDollar(totalTvl, 0)}</svelte:fragment>
				<svelte:fragment slot="popup">This is the sum of TVL in all listed vaults on this page.</svelte:fragment>
			</Tooltip>
			<Tooltip>
				<svelte:fragment slot="trigger">Avg. return {formatPercent(avgTvlWeightedApy1M, 2)}</svelte:fragment>
				<svelte:fragment slot="popup"
					>This is a TVL-weighted average annualised return for 30 days period for all vaults on this list. Net returns
					is used when known for the vault protocol, otherwise we assume the reported returns are fee-inclusive.</svelte:fragment
				>
			</Tooltip>
			{#if !showFilters}
				<Tooltip>
					<svelte:fragment slot="trigger">{tvlTriggerLabel ?? `Min ${formatDollar(tvlThreshold, 0)}`}</svelte:fragment>
					<svelte:fragment slot="popup"
						>{tvlTooltip ??
							`The listing is limited to vaults with a minimum of ${formatDollar(tvlThreshold, 0)} TVL deposited currently.`}</svelte:fragment
					>
				</Tooltip>
			{/if}
			<Tooltip>
				<svelte:fragment slot="trigger">Stablecoin-only</svelte:fragment>
				<svelte:fragment slot="popup"
					>We list stablecoin-denominated vaults only. This excludes vaults with cryptocurrency denominator like ETH or
					BTC.</svelte:fragment
				>
			</Tooltip>
			<span
				><Tooltip>
					<svelte:fragment slot="trigger">Updated <Timestamp date={topVaults.generated_at} relative /></svelte:fragment>
					<svelte:fragment slot="popup">Metrics are updated daily.</svelte:fragment>
				</Tooltip></span
			>
		</div>

		{#if showFilters}
			<div class="table-filters">
				<div class="filter-group">
					<span class="filter-label">Min TVL</span>
					<div class="tvl-dropdown" use:clickOutside={() => (tvlDropdownOpen = false)}>
						<button class="tvl-trigger" onclick={() => (tvlDropdownOpen = !tvlDropdownOpen)}>
							{selectedTvlOption.label}
							<IconChevronDown />
						</button>
						{#if tvlDropdownOpen}
							<ul class="tvl-options">
								{#each tvlFilterOptions as option (option.key)}
									<li>
										<button
											class:active={selectedTvlKey === option.key}
											onclick={() => {
												selectedTvlKey = option.key;
												tvlDropdownOpen = false;
											}}
										>
											{option.optionLabel}
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</div>

				<div class="filter-group">
					<span class="filter-label">Age</span>
					<Select bind:value={selectedAgeIndex}>
						{#each ageFilterOptions as option, i (option.label)}
							<option value={i}>{option.label}</option>
						{/each}
					</Select>
				</div>

				<div class="filter-group">
					<Tooltip>
						<span class="filter-label filter-label-hint" slot="trigger">Technical risk</span>
						<svelte:fragment slot="popup">
							The vault technical risk framework is still in beta and we are expecting changes.
							<a href={resolve('/blog/announcing-vault-technical-risk-framework-beta')} target="_blank"
								>Read this blog post for more information.</a
							>
						</svelte:fragment>
					</Tooltip>
					<div class="tvl-dropdown" use:clickOutside={() => (riskDropdownOpen = false)}>
						<button class="tvl-trigger" onclick={() => (riskDropdownOpen = !riskDropdownOpen)}>
							{selectedRisk.label}
							<IconChevronDown />
						</button>
						{#if riskDropdownOpen}
							<ul class="tvl-options">
								{#each riskFilterOptions as option, i (option.label)}
									<li>
										<button
											class:active={selectedRiskIndex === i}
											onclick={() => {
												selectedRiskIndex = i;
												riskDropdownOpen = false;
											}}
										>
											{option.optionLabel}
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</div>

				<div class="filter">
					<TextInput
						bind:value={filterValue}
						type="search"
						placeholder="Search by name, protocol, chain, denomination, risk or address"
						data-testid="vault-search"
					/>
				</div>
			</div>
		{:else}
			<div class="filter">
				<TextInput
					bind:value={filterValue}
					type="search"
					placeholder="Search by name, protocol, chain, denomination, risk or address"
					data-testid="vault-search"
				/>
			</div>
		{/if}
	</div>

	<div class="table-wrapper">
		<!-- --table-width needed for proper tr.targetable styling  -->
		<table bind:offsetWidth style:--table-width="{offsetWidth}px">
			<thead>
				<tr>
					<th class="index"></th>
					{#if showChainCol}
						{@render sortColHeader(
							'',
							'chain',
							'asc',
							stringCompare((v) => getChain(v.chain_id)?.name ?? `Chain ${v.chain_id}`)
						)}
					{/if}
					{@render sortColHeader(
						'Vault',
						'vault',
						'asc',
						stringCompare((v) => `${v.name.trim()} ${v.protocol}`)
					)}
					{@render sortColHeader(
						'1M<br/>return ann.',
						'one_month_return_ann',
						'desc',
						rankVaultsBy(['one_month_cagr', 'one_month_cagr_net'])
					)}
					{@render sortColHeader(
						'3M<br/>return ann.',
						'three_months_return_ann',
						'desc',
						rankVaultsBy(['three_months_cagr', 'three_months_cagr_net'])
					)}
					{@render sortColHeader(
						'Lifetime return ann.',
						'lifetime_return_ann',
						'desc',
						rankVaultsBy(['cagr', 'cagr_net'])
					)}
					{@render sortColHeader(
						'Lifetime return abs.',
						'lifetime_return_abs',
						'desc',
						rankVaultsBy(['lifetime_return', 'lifetime_return_net'])
					)}
					{@render sortColHeader('3m Sharpe', 'three_months_sharpe', 'desc', rankVaultsBy(['three_months_sharpe']))}
					{@render sortColHeader(
						'3M Vola&shy;tility',
						'three_months_volatility',
						'asc',
						rankVaultsBy(['three_months_volatility'])
					)}
					{@render sortColHeader(
						'Denom&shy;ination',
						'denomination',
						'asc',
						stringCompare((v) => v.denomination)
					)}
					{@render sortColHeader(
						'TVL USD<br/>(current/&ZeroWidthSpace;peak)',
						'tvl',
						'desc',
						rankVaultsBy(['current_nav', 'peak_nav'])
					)}
					{@render sortColHeader('Age (y)', 'age', 'desc', rankVaultsBy(['years']))}
					{@render sortColHeader(
						'Fees<br />(mgmt/&ZeroWidthSpace;perf)',
						'fees',
						'asc',
						rankVaultsBy(['mgmt_fee', 'perf_fee'], Infinity)
					)}
					{@render sortColHeader('Lockup', 'lockup', 'asc', rankVaultsBy(['lockup'], Infinity))}
					{@render sortColHeader('Protocol Technical Risk', 'risk', 'asc', rankVaultsBy(['risk_numeric'], Infinity))}
					<th class="sparkline">3M price</th>
				</tr>
			</thead>
			<tbody>
				{#each visibleVaults as vault (vault.id)}
					{@const chain = getChain(vault.chain_id)}
					{@const blacklisted = isBlacklisted(vault)}
					{@const badStatus = !isGoodVaultStatus(vault)}
					{@const statusReason = [vault.deposit_closed_reason, vault.redemption_closed_reason]
						.filter(Boolean)
						.join('; ')}
					<tr class={['targetable', blacklisted && 'blacklisted']}>
						<!-- index cell is populated with row index via `rowNumber` CSS counter -->
						<td class="index"></td>
						{#if showChainCol}
							<td class="chain">
								<ChainCell {chain} label={chain?.name ?? `Chain ${vault.chain_id}`} />
							</td>
						{/if}
						<td class="vault">
							<div class="multiline">
								<strong>{vault.name}</strong>
								{#if vault.protocol}
									<span class="secondary">{vault.protocol}</span>
								{/if}
							</div>
						</td>
						<td class="one_month_return_ann right net-gross">
							{@render netGrossCell(vault.one_month_cagr_net, vault.one_month_cagr, formatReturn)}
						</td>
						<td class="three_months_return_ann right net-gross">
							{@render netGrossCell(vault.three_months_cagr_net, vault.three_months_cagr, formatReturn)}
						</td>
						<td class="lifetime_return_ann right net-gross">
							{@render netGrossCell(vault.cagr_net, vault.cagr, formatReturn)}
						</td>
						<td class="lifetime_return_abs right net-gross">
							{@render netGrossCell(vault.lifetime_return_net, vault.lifetime_return, formatReturn)}
						</td>
						<td class="three_months_sharpe right">
							{formatNumber(vault.three_months_sharpe, 1)}
						</td>
						<td class="three_months_volatility right">
							{formatVolatility(vault.three_months_volatility)}
						</td>
						<td class="denomination center">
							{formatValue(vault.denomination)}
						</td>
						<td class="tvl right">
							<div class="multiline multival">
								<span class="primary">{formatTvl(vault.current_nav)}</span>
								<span class="secondary">{formatTvl(vault.peak_nav)}</span>
							</div>
						</td>
						<td class="age right">
							{formatNumber(vault.years, 1)}
						</td>
						<td class="fees right">
							<FeesCell mgmt_fee={vault.mgmt_fee} perf_fee={vault.perf_fee} />
						</td>
						<td class={['lockup', vault.lockup === null && 'unknown']}>
							{#if badStatus}
								<Tooltip>
									<svelte:fragment slot="trigger">
										<span class="status-wrapper">
											<IconClock />{getFormattedLockup(vault)}
										</span>
									</svelte:fragment>
									<svelte:fragment slot="popup"
										>The vault deposit or redemption may be currently closed: {statusReason}.</svelte:fragment
									>
								</Tooltip>
							{:else}
								{getFormattedLockup(vault)}
							{/if}
						</td>
						<td class="risk">
							<RiskCell risk={vault.risk} />
						</td>
						<td class="sparkline">
							{#if !vaultSparklinesUrl || failedSparklines.has(vault.id)}
								chart data unavailable
							{:else}
								<img
									loading="lazy"
									src="{vaultSparklinesUrl}/sparkline-90d-{vault.id}.svg"
									alt="{vault.name} 90 day price"
									onerror={() => failedSparklines.add(vault.id)}
								/>
							{/if}
							<TargetableLink label="View {vault.name} details" href={resolveVaultDetails(vault)} class="row-link" />
						</td>
					</tr>
				{/each}
				{#if hasMoreRows}
					<tr class="load-more-sentinel" data-testid="load-more-sentinel">
						<td colspan="16">
							<div use:inview={{ rootMargin: '300px' }} oninview_enter={() => (maxVisibleRows += ROW_BATCH_SIZE)}>
								Loading more vaults... ({maxVisibleRows} of {sortedVaults.length})
							</div>
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>
</div>

<style>
	.top-vaults-table {
		display: grid;
		gap: 1rem;

		.table-extras {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;

			gap: 1rem 1.5rem;
			align-items: center;
			margin-top: 1rem;
			--text-input-width: 100%;

			@media (--viewport-md-down) {
				grid-template-columns: 1fr;
			}
		}

		.table-stats {
			display: flex;
			flex-wrap: wrap;
			flex-grow: 1;
			gap: 0.25rem 0;
			color: var(--c-text-extra-light);
			font: var(--f-ui-md-medium);

			> :global(*):not(:last-child)::after {
				content: '|';
				margin-left: 0.1rem;
				margin-right: 0.3rem;
				opacity: 0.5;
			}
		}

		.table-filters {
			display: flex;
			flex-wrap: wrap;
			gap: 0.75rem 1.5rem;
			align-items: center;
			width: 100%;
			font: var(--f-ui-sm-medium);

			> .filter {
				flex: 1 12rem;
			}
		}

		.filter-group {
			display: flex;
			align-items: center;
			gap: 0.375rem;
		}

		.filter-label {
			color: var(--c-text-extra-light);
			white-space: nowrap;
		}

		.filter-label-hint {
			text-decoration: underline;
			text-decoration-style: dashed;
			text-underline-offset: 0.2em;
			cursor: help;
		}

		.tvl-dropdown {
			position: relative;
		}

		.tvl-trigger {
			display: inline-flex;
			align-items: center;
			gap: 0.25rem;
			padding: var(--space-sl);
			padding-right: calc(var(--space-sl) + var(--space-lg));
			border: 1px var(--c-input-border) solid;
			border-radius: var(--radius-sm);
			background: var(--c-input-background);
			color: inherit;
			font: inherit;
			cursor: pointer;
			position: relative;

			&:hover,
			&:focus-within {
				background: var(--c-input-background-focus);
			}

			:global(.icon) {
				position: absolute;
				right: var(--space-sl);
				--icon-size: 0.875em;
				pointer-events: none;
			}
		}

		.tvl-options {
			position: absolute;
			top: 100%;
			left: 0;
			z-index: 10;
			margin-top: 0.25rem;
			padding: 0.25rem 0;
			min-width: 100%;
			width: max-content;
			border: 1px var(--c-input-border) solid;
			border-radius: var(--radius-sm);
			background: var(--c-body);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
			list-style: none;

			li button {
				display: block;
				width: 100%;
				padding: 0.5rem 0.75rem;
				border: none;
				background: transparent;
				color: inherit;
				font: inherit;
				text-align: left;
				white-space: nowrap;
				cursor: pointer;

				&:hover {
					background: var(--c-box-2);
				}

				&.active {
					background: var(--c-box-3);
					font-weight: 600;
				}
			}
		}

		.filter-group :global(.select) {
			font: inherit;
		}

		.filter {
			flex: 1 24rem;
		}

		.table-wrapper {
			width: 100%;

			/*
				Setting overflow:auto breaks the sticky header, but is needed to allow horizontal scrolling
				on smaller viewports. Best compromise is to only set overflow on smaller viewports.
			 */
			@media (--viewport-xl-down) {
				overflow-x: auto;
			}
		}

		table {
			position: relative;
			table-layout: fixed;
			border-collapse: collapse;
			width: 86rem;
			color: inherit;
			font: var(--f-mono-xs-regular);
			line-height: 1;
			letter-spacing: var(--f-text-md-spacing, normal);
			counter-reset: rowNumber;

			@media (--viewport-sm-down) {
				min-width: 64rem;
			}

			@media (--viewport-xs) {
				font-size: 14px;
			}

			:is(td, th) {
				vertical-align: top;
			}

			th {
				position: sticky;
				top: 0px;
				z-index: 1;
				/* sticky header background must be solid (no transparency) */
				background: color-mix(in srgb, var(--c-body), hsl(var(--hsl-box)) var(--box-4-alpha));
				/* sticky header border gets lost on scroll, so use box-shadow instead */
				box-shadow: inset 0px -2px var(--c-text-extra-light);
				/* add extra padding to bottom to account for the inset box-shadow */
				--th-padding: 0.5rem 0.5rem calc(0.5rem + 2px) 0.5rem;
				font-weight: 900;
				text-transform: uppercase;
				text-align: left;

				&:not(:has(button)) {
					padding: var(--th-padding);
				}

				button {
					display: flex;
					border: none;
					width: 100%;
					min-height: 3rem;
					padding: var(--th-padding);
					background: transparent;
					font: inherit;
					text-align: inherit;
					text-transform: inherit;
					cursor: pointer;
				}

				:global(.icon) {
					position: absolute;
					top: 0.625rem;
					right: 0.125rem;
					left: var(--icon-left, auto);
					min-width: 1em;
					--icon-size: 0.875em;

					:global(*) {
						stroke-width: 3;
					}
				}
			}

			td {
				border-block: 1px solid var(--c-text-ultra-light);
				padding: 0.25em 0.5em;

				--c-col-a: var(--c-box-3);
				--c-col-b: var(--c-box-1);

				/* alternating column colors */
				&:nth-child(even) {
					background-color: var(--c-col-a);
				}

				&:nth-child(odd) {
					background-color: var(--c-col-b);
				}

				&.right {
					text-align: right;
				}

				&.center {
					text-align: center;
				}
			}

			/* reverse column colors if chain col is present */
			:where(tr:has(.chain)) td {
				&:nth-child(odd) {
					background-color: var(--c-col-a);
				}

				&:nth-child(even) {
					background-color: var(--c-col-b);
				}
			}

			tr.blacklisted td {
				text-decoration: line-through;
			}

			td:global(:has(.tooltip)) {
				position: relative;
			}

			:global(.multiline) {
				display: grid;
				gap: 0.5rem;
			}

			:global(.secondary) {
				opacity: 0.7;
			}

			.multival {
				> ::before {
					content: '(';
				}

				> ::after {
					content: ')';
				}

				.primary {
					font-weight: 600;

					&::before,
					&::after {
						visibility: hidden;
					}
				}
			}

			/**
			 * Column-specific widths and style overrides
			 */
			.index {
				width: 2.25rem;

				/* no background on index column header */
				&:is(th) {
					background: var(--c-body);
				}

				&:is(td) {
					text-align: center;
					vertical-align: middle;
					background-color: var(--c-col-b);
					counter-increment: rowNumber;

					&::before {
						content: counter(rowNumber);
					}
				}
			}

			.chain {
				width: 1.875rem;
				--icon-left: calc(50% - 1ex);

				&:is(td) {
					vertical-align: middle;
					/* override background color to match vault column */
					background-color: var(--c-col-a);
				}
			}

			.vault {
				width: 20.5%;
				--icon-left: 8ch;
			}

			:is(.one_month_return_ann, .three_months_return_ann, .lifetime_return_ann, .lifetime_return_abs) {
				width: 6.5%;
			}

			:is(.three_months_sharpe, .three_months_volatility) {
				width: 4.5%;
			}

			.denomination {
				width: 5%;
			}

			.tvl {
				width: 6.25%;
			}

			.age {
				width: 3.5%;
			}

			.fees {
				width: 4.5%;
			}

			.lockup {
				width: 7.5%;

				&.unknown {
					color: var(--c-text-light);
				}

				&:has(:global(.icon)) {
					color: var(--c-warning);
				}

				.status-wrapper {
					display: inline-flex;
					align-items: center;
					gap: 0.25rem;
					white-space: nowrap;
					--icon-size: 0.875rem;
				}
			}

			.risk {
				width: 5.5%;

				:global(.popup) {
					right: 0;
					white-space: nowrap;
				}
			}

			td:is(.lockup, .risk) {
				font: var(--f-ui-xs-medium);
				letter-spacing: 0.02em;
			}

			.sparkline {
				width: 9%;

				&:is(td) {
					text-align: center;
					vertical-align: middle;
					color: var(--c-text-ultra-light);
				}

				img {
					width: 100%;
				}
			}

			.net-gross :global(.popup) {
				width: 17rem;
			}

			:global(.row-link):hover {
				background: var(--c-box-2);
			}

			.load-more-sentinel td {
				text-align: center;
				padding: 1.5rem;
				color: var(--c-text-light);
				font: var(--f-ui-sm-medium);
			}
		}
	}

	.capped-hint {
		text-decoration: underline;
		text-decoration-style: dashed;
		cursor: help;
	}
</style>
