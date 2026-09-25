<!--
Performance metrics table for a vault across multiple lookback periods.
-->
<script lang="ts">
	import type { VaultInfo, PeriodMetrics } from '$lib/top-vaults/schemas';
	import type { Chain } from '$lib/helpers/chain';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import {
		formatPercent,
		formatPercentProfit,
		formatDollar,
		formatKeyMetricNumber,
		formatNumber,
		notFilledMarker
	} from '$lib/helpers/formatters';
	import { getVaultProtocolDisplayName, isUnknownVaultProtocol } from '$lib/top-vaults/helpers';
	import { base } from '$app/paths';

	interface Props {
		vault: VaultInfo;
		chain: Chain;
		showRankings?: boolean;
	}

	let { vault, chain, showRankings = true }: Props = $props();

	// Ordered list of periods to display as columns
	const periodOrder = ['1w', '1m', '3m', '6m', '1y', 'lifetime'] as const;
	const periodLabels: Record<string, string> = {
		'1w': 'Week',
		'1m': 'Month',
		'3m': '3 months',
		'6m': '6 months',
		'1y': 'Year',
		lifetime: 'Lifetime'
	};

	// Create a map of period -> metrics for quick lookup
	const periodMap = $derived(
		vault.period_results?.reduce(
			(acc, metrics) => {
				acc[metrics.period.toLowerCase()] = metrics;
				return acc;
			},
			{} as Record<string, PeriodMetrics>
		) ?? {}
	);

	// Check if any period has an error
	const hasAnyError = $derived(vault.period_results?.some((p) => p.error_reason != null) ?? false);

	// Check if net fee information is available
	const hasNetFees = $derived(vault.net_fees?.fee_mode != null);
	const netTransactionFees = $derived(
		[
			{ label: 'deposit', value: vault.net_fees?.deposit },
			{ label: 'withdrawal', value: vault.net_fees?.withdraw }
		].filter((fee): fee is { label: string; value: number } => typeof fee.value === 'number' && fee.value > 0)
	);
	const hasNetTransactionFees = $derived(netTransactionFees.length > 0);
	const netReturnFeeTooltip = $derived.by(() => {
		const fees = netTransactionFees.map((fee) => `${formatPercent(fee.value)} ${fee.label} fee`);
		if (fees.length === 0) return '';

		const feeDescription = fees.length === 2 ? `${fees[0]} and ${fees[1]}` : fees[0];

		return `Net returns include the ${feeDescription}. These one-time fees are applied when you enter or exit the vault, so they can make a short-period net return negative even when gross returns are positive.`;
	});

	type RowDefinition = {
		label: string | (() => string);
		href?: string;
		field: keyof PeriodMetrics;
		formatter: (value: unknown) => string;
		hidden?: boolean; // hidden until expanded
		excluded?: boolean; // permanently excluded from display
	};

	function getLabel(row: RowDefinition): string {
		return typeof row.label === 'function' ? row.label() : row.label;
	}

	// Expanded state - toggled by the View all control
	let expanded = $state(false);

	// Row definitions in display order
	let rows: RowDefinition[] = $derived([
		{
			label: 'Ranking overall',
			href: `${base}/vaults`,
			field: 'ranking_overall',
			formatter: (v) => (v != null ? `#${v}` : notFilledMarker),
			excluded: !showRankings
		},
		{
			label: `Ranking on ${chain.name}`,
			href: `${base}/vaults/chains/${chain.slug}`,
			field: 'ranking_chain',
			formatter: (v) => (v != null ? `#${v}` : notFilledMarker),
			excluded: !showRankings
		},
		{
			label: `Ranking on ${getVaultProtocolDisplayName(vault)}`,
			href: `${base}/vaults/protocols/${vault.protocol_slug}`,
			field: 'ranking_protocol',
			formatter: (v) => (v != null ? `#${v}` : notFilledMarker),
			excluded: !showRankings || isUnknownVaultProtocol(vault)
		},
		{
			label: 'CAGR (net)',
			href: `${base}/glossary/cagr`,
			field: 'cagr_net',
			formatter: (v) => (hasNetFees ? formatPercentProfit(v as number | null) : notFilledMarker)
		},
		{
			label: 'CAGR (gross)',
			href: `${base}/glossary/cagr`,
			field: 'cagr_gross',
			formatter: (v) => formatPercentProfit(v as number | null)
		},
		{
			label: 'Returns (net)',
			field: 'returns_net',
			formatter: (v) => (hasNetFees ? formatPercentProfit(v as number | null) : notFilledMarker)
		},
		{ label: 'Returns (gross)', field: 'returns_gross', formatter: (v) => formatPercentProfit(v as number | null) },
		{
			label: 'Sharpe ratio',
			href: `${base}/glossary/sharpe`,
			field: 'sharpe',
			formatter: (v) => formatKeyMetricNumber(v as number | null)
		},
		{
			label: 'Max drawdown',
			href: `${base}/glossary/maximum-drawdown`,
			field: 'max_drawdown',
			formatter: (v) => formatPercent(v as number | null)
		},
		{
			label: 'Volatility',
			href: `${base}/glossary/volatility`,
			field: 'volatility',
			formatter: (v) => formatPercent(v as number | null),
			hidden: true
		},
		{
			label: 'TVL low',
			href: `${base}/glossary/total-value-locked-tvl`,
			field: 'tvl_low',
			formatter: (v) => formatDollar(v as number | null),
			hidden: true
		},
		{
			label: 'TVL high',
			href: `${base}/glossary/total-value-locked-tvl`,
			field: 'tvl_high',
			formatter: (v) => formatDollar(v as number | null),
			hidden: true
		},
		{
			label: () => `Share price start (${vault.denomination})`,
			field: 'share_price_start',
			formatter: (v) => formatNumber(v as number | null, 4, 6),
			hidden: true
		},
		{
			label: () => `Share price end (${vault.denomination})`,
			field: 'share_price_end',
			formatter: (v) => formatNumber(v as number | null, 4, 6),
			hidden: true
		},
		{
			label: 'Period data availability',
			field: 'daily_samples',
			formatter: formatDays,
			hidden: true
		},
		{ label: 'Period start', field: 'period_start_at', formatter: formatDate, hidden: true },
		{ label: 'Period end', field: 'period_end_at', formatter: formatDate, hidden: true },
		{
			label: 'Raw samples',
			field: 'raw_samples',
			formatter: (v) => (v != null ? String(v) : notFilledMarker),
			hidden: true
		},
		{ label: 'Samples start', field: 'samples_start_at', formatter: formatDate, hidden: true },
		{ label: 'Samples end', field: 'samples_end_at', formatter: formatDate, hidden: true }
	]);

	// Filter rows: exclude permanently excluded rows; show hidden rows only when expanded
	const visibleRows = $derived(rows.filter((r) => !r.excluded && (expanded || !r.hidden)));

	function formatDate(value: unknown): string {
		if (value == null) return notFilledMarker;
		const dateStr = String(value);
		// Extract YYYY-MM-DD from ISO datetime
		return dateStr.split('T')[0] ?? notFilledMarker;
	}

	function formatDays(value: unknown): string {
		if (value == null) return notFilledMarker;
		const days = Number(value);
		if (!Number.isFinite(days)) return notFilledMarker;
		return `${days} ${days === 1 ? 'day' : 'days'}`;
	}

	function getValue(period: string, field: keyof PeriodMetrics): unknown {
		return periodMap[period]?.[field] ?? null;
	}

	function isNetReturn(row: RowDefinition): boolean {
		return row.field === 'cagr_net' || row.field === 'returns_net';
	}
</script>

{#if vault.period_results?.length}
	<div class="periodic-metrics">
		<MetricsBox title="Returns and period details">
			<div class="table-wrapper">
				<table class="period-table">
					<thead>
						<tr>
							<th class="label-col">Metric</th>
							{#each periodOrder as period (period)}
								<th>{periodLabels[period]}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#if hasAnyError}
							<tr class="error-row">
								<td class="label">Error</td>
								{#each periodOrder as period (period)}
									<td class="error-value">{periodMap[period]?.error_reason ?? notFilledMarker}</td>
								{/each}
							</tr>
						{/if}
						{#each visibleRows as row (row.field)}
							<tr>
								<td class="label">
									{#if row.href}
										<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href includes the configured base path -->
										<a href={row.href}>{getLabel(row)}</a>
									{:else}
										{getLabel(row)}
									{/if}
								</td>
								{#each periodOrder as period (period)}
									<td>
										{#if hasNetTransactionFees && isNetReturn(row)}
											<Tooltip>
												<span slot="trigger" class="net-return-with-fees">
													{row.formatter(getValue(period, row.field))}
												</span>
												<svelte:fragment slot="popup">{netReturnFeeTooltip}</svelte:fragment>
											</Tooltip>
										{:else}
											{row.formatter(getValue(period, row.field))}
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
			<button class="view-all" type="button" onclick={() => (expanded = !expanded)} aria-expanded={expanded}>
				{expanded ? 'View less' : 'View all'}
			</button>
		</MetricsBox>
	</div>
{/if}

<style>
	.table-wrapper {
		overflow-x: auto;
	}

	.view-all {
		margin-top: 1rem;
		padding: 0;
		border: 0;
		background: none;
		color: var(--c-text-light);
		font: var(--f-ui-md-medium);
		text-decoration: underline;
		cursor: pointer;

		&:hover {
			color: var(--c-text);
		}
	}

	.period-table {
		width: 100%;
		border-collapse: collapse;
		font: var(--f-ui-md-roman);

		@media (--viewport-sm-down) {
			font: var(--f-ui-sm-roman);
		}

		th,
		td {
			padding: 0.5rem 0.75rem;
			text-align: right;
			white-space: nowrap;

			@media (--viewport-sm-down) {
				padding: 0.375rem 0.5rem;
			}
		}

		th {
			font-weight: bold;
			color: var(--c-text);
			border-bottom: 1px solid var(--c-text-extra-light);
		}

		.label-col {
			text-align: left;
		}

		td:not(.label) {
			color: var(--c-text-light);
		}

		tr {
			border-bottom: 1px solid var(--c-box-3);

			&:last-child {
				border-bottom: none;
			}
		}

		.label {
			font-weight: bold;
			color: var(--c-text);
			text-align: left;

			:global(a) {
				text-decoration: underline;
				text-decoration-style: dashed;
			}
		}

		.net-return-with-fees {
			border-bottom: 1px dashed var(--c-text-light);
		}

		.error-row {
			background: var(--c-warning-bg, rgba(255, 200, 0, 0.1));

			.error-value {
				color: var(--c-warning, #b45309);
				font-size: 0.875em;
				white-space: normal;
				word-break: break-word;
				min-width: 8rem;
				max-width: 12rem;
			}
		}
	}
</style>
