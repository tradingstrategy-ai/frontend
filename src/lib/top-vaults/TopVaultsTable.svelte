<script lang="ts">
	import type { TopVaults, VaultInfo } from './schemas';
	import type { Chain } from '$lib/helpers/chain';
	import Alert from '$lib/components/Alert.svelte';
	import CryptoAddressWidget from '$lib/components/CryptoAddressWidget.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import TopVaultsOptIn from './TopVaultsOptIn.svelte';
	import ChainCell from './ChainCell.svelte';
	import FeesCell from './FeesCell.svelte';
	import DepositEventsCell from './DepositEventsCell.svelte';
	import RiskCell from './RiskCell.svelte';
	import IconChevronUp from '~icons/local/chevron-up';
	import IconChevronDown from '~icons/local/chevron-down';
	import { getChain, getExplorerUrl } from '$lib/helpers/chain';
	import { formatDollar, formatNumber, formatPercent, formatValue } from '$lib/helpers/formatters';

	interface SortOptions {
		key: string;
		direction: 'asc' | 'desc';
		compareFn: (a: VaultInfo, b: VaultInfo) => number;
	}

	interface Props {
		topVaults: TopVaults;
		chain?: Chain;
	}

	const { topVaults, chain }: Props = $props();

	const formatReturn = (v: MaybeNumber) => formatPercent(v, 2);
	const formatTvl = (v: MaybeNumber) => formatDollar(v, 2);

	let filterValue = $state('');

	// filter vaults
	let filteredVaults = $derived.by(() => {
		const filterCompareStr = filterValue.trim().toLowerCase();
		return topVaults.vaults.filter((v) => {
			const chain = getChain(v.chain_id);
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

	let sortOptions = $state<SortOptions>({
		key: 'one_month_return_ann',
		direction: 'desc',
		compareFn: multiValCompare(['one_month_cagr_net', 'one_month_cagr'])
	});

	// sort vaults
	let sortedVaults = $derived.by(() => {
		const sorted = filteredVaults.toSorted(sortOptions.compareFn);
		if (sortOptions.direction === 'desc') sorted.reverse();
		return sorted;
	});

	function multiValCompare(keys: (keyof VaultInfo)[], defaultValue = -Infinity) {
		return (a: VaultInfo, b: VaultInfo) => {
			for (const key of keys) {
				const aVal = a[key] as number | null;
				const bVal = b[key] as number | null;
				if (aVal === bVal) continue;
				return (aVal ?? defaultValue) - (bVal ?? defaultValue);
			}
			return 0;
		};
	}

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
			{#if sortOptions.key === key}
				{#if sortOptions.direction === 'asc'}
					<IconChevronUp />
				{:else}
					<IconChevronDown />
				{/if}
			{/if}
		</button>
	</th>
{/snippet}

{#snippet multiVal<T = MaybeNumber>(values: [T, T], formatter: Formatter<T>)}
	<div class="multiline multival">
		<span class="primary">{formatter(values[0])}</span>
		<span class="secondary">{formatter(values[1])}</span>
	</div>
{/snippet}

<div class="top-vaults">
	<TopVaultsOptIn />

	{#if !topVaults.vaults.length}
		<Alert title="Error">No vault data available.</Alert>
	{:else}
		<div class="table-extras">
			<div class="table-meta">
				<span>{topVaults.vaults.length} {chain?.name ?? 'total'} vaults</span>
				<span>Updated <Timestamp date={topVaults.generated_at} relative /></span>
			</div>
			<TextInput bind:value={filterValue} type="search" placeholder="Search vaults" />
		</div>

		<div class="table-wrapper">
			<table class="top-vaults-table">
				<thead>
					<tr>
						<th class="index"></th>
						{@render sortColHeader(
							'',
							'chain',
							'asc',
							stringCompare((v) => getChain(v.chain_id)?.name ?? `Chain ${v.chain_id}`)
						)}
						{@render sortColHeader(
							'Vault',
							'vault',
							'asc',
							stringCompare((v) => `${v.name.trim()} ${v.protocol}`)
						)}
						{@render sortColHeader(
							'1M return ann.<br/>(net/&ZeroWidthSpace;gross)',
							'one_month_return_ann',
							'desc',
							multiValCompare(['one_month_cagr_net', 'one_month_cagr'])
						)}
						{@render sortColHeader(
							'3M return ann.<br/>(net/&ZeroWidthSpace;gross)',
							'three_months_return_ann',
							'desc',
							multiValCompare(['three_months_cagr_net', 'three_months_cagr'])
						)}
						{@render sortColHeader(
							'Lifetime return ann.<br/>(net/&ZeroWidthSpace;gross)',
							'lifetime_return_ann',
							'desc',
							multiValCompare(['cagr_net', 'cagr'])
						)}
						{@render sortColHeader(
							'Lifetime return abs.<br/>(net/&ZeroWidthSpace;gross)',
							'lifetime_return_abs',
							'desc',
							multiValCompare(['lifetime_return_net', 'lifetime_return'])
						)}
						{@render sortColHeader(
							'3m Sharpe',
							'three_months_sharpe',
							'desc',
							multiValCompare(['three_months_sharpe'])
						)}
						{@render sortColHeader(
							'3M Vola&shy;tility',
							'three_months_volatility',
							'asc',
							multiValCompare(['three_months_volatility'])
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
							multiValCompare(['current_nav', 'peak_nav'])
						)}
						{@render sortColHeader('Age (Years)', 'age', 'desc', multiValCompare(['years']))}
						{@render sortColHeader(
							'Fees<br />(mgmt/&ZeroWidthSpace;perf)',
							'fees',
							'asc',
							multiValCompare(['mgmt_fee', 'perf_fee'], Infinity)
						)}
						{@render sortColHeader('Deposit Events', 'event_count', 'desc', multiValCompare(['event_count']))}
						{@render sortColHeader(
							'Protocol Technical Risk',
							'risk',
							'asc',
							multiValCompare(['risk_numeric'], Infinity)
						)}
						<th class="address">Vault Address</th>
					</tr>
				</thead>
				<tbody>
					{#each sortedVaults as vault (vault.id)}
						{@const chain = getChain(vault.chain_id)}
						<tr>
							<!-- index cell is populated with row index via `rowNumber` CSS counter -->
							<td class="index"></td>
							<td class="chain">
								<ChainCell {chain} label={chain?.name ?? `Chain ${vault.chain_id}`} />
							</td>
							<td class="vault">
								<div class="multiline">
									<strong>{vault.name}</strong>
									{#if vault.protocol}
										<span class="secondary">{vault.protocol}</span>
									{/if}
								</div>
							</td>
							<td class="one_month_return_ann right">
								{@render multiVal([vault.one_month_cagr_net, vault.one_month_cagr], formatReturn)}
							</td>
							<td class="three_months_return_ann right">
								{@render multiVal([vault.three_months_cagr_net, vault.three_months_cagr], formatReturn)}
							</td>
							<td class="lifetime_return_ann right">
								{@render multiVal([vault.cagr_net, vault.cagr], formatReturn)}
							</td>
							<td class="lifetime_return_abs right">
								{@render multiVal([vault.lifetime_return_net, vault.lifetime_return], formatReturn)}
							</td>
							<td class="three_months_sharpe right">
								{formatNumber(vault.three_months_sharpe, 1)}
							</td>
							<td class="three_months_volatility right">
								{formatPercent(vault.three_months_volatility, 1)}
							</td>
							<td class="denomination center">
								{formatValue(vault.denomination)}
							</td>
							<td class="tvl right">
								{@render multiVal([vault.current_nav, vault.peak_nav], formatTvl)}
							</td>
							<td class="age right">
								{formatNumber(vault.years, 1)}
							</td>
							<td class="fees right">
								<FeesCell mgmt_fee={vault.mgmt_fee} perf_fee={vault.perf_fee} />
							</td>
							<td class="event_count right">
								<DepositEventsCell value={vault.event_count} />
							</td>
							<td class="risk">
								<RiskCell risk={vault.risk} risk_numeric={vault.risk_numeric} />
							</td>
							<td class="address">
								<CryptoAddressWidget
									class="vault-address"
									size="sm"
									address={vault.address}
									href={getExplorerUrl(chain, vault.address)}
								/>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.top-vaults {
		display: grid;
		gap: 1rem;

		.table-extras {
			display: grid;
			grid-template-columns: 1fr 24rem;
			gap: 1rem;
			align-items: center;
			margin-top: 1rem;
			--text-input-width: 100%;

			@media (--viewport-sm-down) {
				grid-template-columns: 1fr;
			}
		}

		.table-meta {
			display: flex;
			gap: 0.75rem;
			color: var(--c-text-extra-light);
			font: var(--f-ui-md-medium);

			> :not(:last-child)::after {
				content: '|';
				margin-left: 0.75rem;
			}
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

		.top-vaults-table {
			position: relative;
			width: 100%;
			border-collapse: collapse;
			min-width: 75rem;
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
					min-height: 4.75rem;
					padding: var(--th-padding);
					background: transparent;
					font: inherit;
					text-align: inherit;
					text-transform: inherit;
					cursor: pointer;
				}

				:global(.icon) {
					min-width: 1em;
					translate: 0.25rem 0;

					:global(*) {
						stroke-width: 3;
					}
				}

				/* custom alignment for chain sort indicator (no header label) */
				&.chain :global(.icon) {
					translate: 0;
				}
			}

			/* no background on index column */
			th.index {
				background: var(--c-body);
			}

			td.chain {
				width: 1.875rem;
			}

			td.vault {
				min-width: 12rem;
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

			td.index {
				text-align: center;
				vertical-align: middle;
				background-color: var(--c-col-b);
				counter-increment: rowNumber;

				&::before {
					content: counter(rowNumber);
				}
			}

			td.chain {
				vertical-align: middle;
				text-align: center;
				padding-right: 0.25rem;
				/* override background color to match vault column */
				background-color: var(--c-col-a);
			}

			:global(.vault-address) {
				min-width: 7rem;
				padding: 0;
				border-radius: 0;
				background: transparent !important;
				font: var(--f-ui-xs-roman);
				letter-spacing: var(--ls-ui-xs, normal);

				:global(a:not(:hover)) {
					text-decoration: none;
				}
			}
		}
	}
</style>
