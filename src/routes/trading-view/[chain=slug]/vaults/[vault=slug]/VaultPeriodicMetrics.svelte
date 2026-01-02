<script lang="ts">
	import type { VaultInfo, PeriodMetrics } from '$lib/top-vaults/schemas';
	import type { Chain } from '$lib/helpers/chain';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import {
		formatPercent,
		formatDollar,
		formatKeyMetricNumber,
		formatNumber,
		notFilledMarker
	} from '$lib/helpers/formatters';
	import { resolve } from '$app/paths';

	interface Props {
		vault: VaultInfo;
		chain: Chain;
	}

	let { vault, chain }: Props = $props();

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

	type RowDefinition = {
		label: string | (() => string);
		field: keyof PeriodMetrics;
		formatter: (value: unknown) => string;
		hidden?: boolean;
	};

	function getLabel(row: RowDefinition): string {
		return typeof row.label === 'function' ? row.label() : row.label;
	}

	// Expanded state - toggled on double-click
	let expanded = $state(false);

	// Row definitions in display order
	const rows: RowDefinition[] = [
		{
			label: `<a href="${resolve('/trading-view/vaults')}">Ranking overall</a>`,
			field: 'ranking_overall',
			formatter: (v) => (v != null ? `#${v}` : notFilledMarker)
		},
		{
			label: `<a href="${resolve(`/trading-view/${chain.slug}/vaults`)}">Ranking on ${chain.name}</a>`,
			field: 'ranking_chain',
			formatter: (v) => (v != null ? `#${v}` : notFilledMarker)
		},
		{
			label: `<a href="${resolve(`/trading-view/vaults/protocols/${vault.protocol_slug}`)}">Ranking on ${vault.protocol}</a>`,
			field: 'ranking_protocol',
			formatter: (v) => (v != null ? `#${v}` : notFilledMarker)
		},
		{
			label: '<a href="/glossary/cagr">CAGR</a> (net)',
			field: 'cagr_net',
			formatter: (v) => (hasNetFees ? formatPercent(v as number | null) : notFilledMarker)
		},
		{
			label: '<a href="/glossary/cagr">CAGR</a> (gross)',
			field: 'cagr_gross',
			formatter: (v) => formatPercent(v as number | null)
		},
		{
			label: 'Returns (net)',
			field: 'returns_net',
			formatter: (v) => (hasNetFees ? formatPercent(v as number | null) : notFilledMarker)
		},
		{ label: 'Returns (gross)', field: 'returns_gross', formatter: (v) => formatPercent(v as number | null) },
		{
			label: '<a href="/glossary/sharpe">Sharpe</a> ratio',
			field: 'sharpe',
			formatter: (v) => formatKeyMetricNumber(v as number | null)
		},
		{
			label: '<a href="/glossary/maximum-drawdown">Max drawdown</a>',
			field: 'max_drawdown',
			formatter: (v) => formatPercent(v as number | null)
		},
		{ label: '<a href="/glossary/volatility">Volatility</a>', field: 'volatility', formatter: (v) => formatPercent(v as number | null) },
		{ label: 'TVL low', field: 'tvl_low', formatter: (v) => formatDollar(v as number | null) },
		{ label: 'TVL high', field: 'tvl_high', formatter: (v) => formatDollar(v as number | null) },
		{
			label: () => `Share price start (${vault.denomination})`,
			field: 'share_price_start',
			formatter: (v) => formatNumber(v as number | null, 4, 6)
		},
		{
			label: () => `Share price end (${vault.denomination})`,
			field: 'share_price_end',
			formatter: (v) => formatNumber(v as number | null, 4, 6)
		},
		{ label: 'Period start', field: 'period_start_at', formatter: formatDate },
		{ label: 'Period end', field: 'period_end_at', formatter: formatDate },
		{
			label: 'Raw samples',
			field: 'raw_samples',
			formatter: (v) => (v != null ? String(v) : notFilledMarker),
			hidden: true
		},
		{
			label: 'Daily samples',
			field: 'daily_samples',
			formatter: (v) => (v != null ? String(v) : notFilledMarker),
			hidden: true
		},
		{ label: 'Samples start', field: 'samples_start_at', formatter: formatDate, hidden: true },
		{ label: 'Samples end', field: 'samples_end_at', formatter: formatDate, hidden: true }
	];

	const visibleRows = $derived(expanded ? rows : rows.filter((r) => !r.hidden));

	function formatDate(value: unknown): string {
		if (value == null) return notFilledMarker;
		const dateStr = String(value);
		// Extract YYYY-MM-DD from ISO datetime
		return dateStr.split('T')[0] ?? notFilledMarker;
	}

	function getValue(period: string, field: keyof PeriodMetrics): unknown {
		return periodMap[period]?.[field] ?? null;
	}
</script>

{#if vault.period_results?.length}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="periodic-metrics" ondblclick={() => (expanded = !expanded)}>
		<MetricsBox title="Performance metrics">
			<div class="table-wrapper">
				<table class="period-table">
					<thead>
						<tr>
							<th class="label-col">Metric</th>
							{#each periodOrder as period}
								<th>{periodLabels[period]}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#if hasAnyError}
							<tr class="error-row">
								<td class="label">Error</td>
								{#each periodOrder as period}
									<td class="error-value">{periodMap[period]?.error_reason ?? notFilledMarker}</td>
								{/each}
							</tr>
						{/if}
						{#each visibleRows as row}
							<tr>
								<td class="label">{@html getLabel(row)}</td>
								{#each periodOrder as period}
									<td>{row.formatter(getValue(period, row.field))}</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</MetricsBox>
	</div>
{/if}

<style>
	.table-wrapper {
		overflow-x: auto;
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
			font-weight: 500;
			color: var(--c-text-light);
			border-bottom: 1px solid var(--c-text-extra-light);
		}

		.label-col {
			text-align: left;
		}

		tr {
			border-bottom: 1px solid var(--c-text-extra-light);

			&:last-child {
				border-bottom: none;
			}
		}

		.label {
			font-weight: 500;
			color: var(--c-text-light);
			text-align: left;

			:global(a) {
				text-decoration: underline;
				text-decoration-style: dashed;
			}
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
