<script lang="ts">
	import type { TopVaults } from './schemas';
	import type { Chain } from '$lib/helpers/chain';
	import { getChain, getExplorerUrl } from '$lib/helpers/chain';
	import Alert from '$lib/components/Alert.svelte';
	import CryptoAddressWidget from '$lib/components/CryptoAddressWidget.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import TopVaultsOptIn from './TopVaultsOptIn.svelte';
	import ChainCell from './ChainCell.svelte';
	import FeesCell from './FeesCell.svelte';
	import DepositEventsCell from './DepositEventsCell.svelte';
	import RiskCell from './RiskCell.svelte';
	import { formatDollar, formatNumber, formatPercent, formatValue } from '$lib/helpers/formatters';

	interface Props {
		topVaults: TopVaults;
		chain?: Chain;
	}

	const { topVaults, chain }: Props = $props();

	const formatReturn = (v: MaybeNumber) => formatPercent(v, 2);
	const formatTvl = (v: MaybeNumber) => formatDollar(v, 2);

	let filterValue = $state('');
</script>

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
						<th class="chain"></th>
						<th class="vault">Vault</th>
						<th class="one_month_return_ann">1M return ann.<br />(net/&ZeroWidthSpace;gross)</th>
						<th class="three_months_return_ann">3M return ann.<br />(net/&ZeroWidthSpace;gross)</th>
						<th class="lifetime_return_ann">Lifetime return ann.<br />(net/&ZeroWidthSpace;gross)</th>
						<th class="lifetime_return_abs">Lifetime return abs.<br />(net/&ZeroWidthSpace;gross)</th>
						<th class="three_months_sharpe">3m Sharpe</th>
						<th class="three_months_volatility">3M Vola-tility</th>
						<th class="denomination">Denom-ination</th>
						<th class="tvl">TVL USD<br />(current/&ZeroWidthSpace;peak)</th>
						<th class="age">Age (Years)</th>
						<th class="fees">Fees<br />(mgmt/&ZeroWidthSpace;perf)</th>
						<th class="event_count">Deposit Events</th>
						<th class="risk">Protocol Technical Risk</th>
						<th class="address">Vault Address</th>
					</tr>
				</thead>
				<tbody>
					{#each topVaults.vaults as vault (vault.id)}
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
				padding: 0.5rem;
				/* add extra padding to bottom to account for the inset box-shadow */
				padding-bottom: calc(0.5rem + 2px);
				font-weight: 900;
				text-transform: uppercase;
				text-align: left;
			}

			th.sorted {
				padding-right: 1.125rem;

				svg {
					position: absolute;
					top: 0.5rem;
					right: 0.25rem;
				}
			}

			/* no background on index column */
			th.index {
				background: var(--c-body);
			}

			/* custom alignment for chain sort indicator (no header label) */
			th.chain.sorted svg {
				right: 0.5rem;
			}

			td.chain {
				width: 1.875rem;
			}

			td.vault {
				min-width: 12rem;
			}

			/* flip the sort indicator on columns that use inverted sort */
			:is(th.chain, th.vault, th.denomination, th.fees, th.risk) svg {
				rotate: 180deg;
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
