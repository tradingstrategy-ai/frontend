<!--
@component
Displays a reconciled investment example for a vault's selected return period.
-->
<script lang="ts">
	import { formatDollar, formatNumber, formatPercent } from '$lib/helpers/formatters';
	import type { ExampleFee, FeaturedPerformanceExample } from './featured-performance';

	interface Props {
		example: FeaturedPerformanceExample;
	}

	let { example }: Props = $props();
	let formattedCapitalIn = $derived(formatDollar(example.capitalIn, 0, 0, { notation: 'standard' }));

	let explanation = $derived(
		example.hasInternalisedFees
			? `This ${formattedCapitalIn} example applies known fees to the selected-period return; gross follows the backend definition and already includes internalised fees, while annualised net return extrapolates one-time entry and exit fees over a year.`
			: `This ${formattedCapitalIn} example applies known fees to the selected-period return; annualised net return extrapolates one-time entry and exit fees over a year.`
	);

	function formatDate(value: string | null): string {
		return value?.split('T')[0] ?? '---';
	}

	function formatFee(fee: ExampleFee): string {
		if (fee.internalised) return `Internalised in share price (${formatPercent(fee.rate, 0, 2)})`;
		if (fee.rate == null) return '---';

		return `${formatDollar(fee.amount, 0, 2)} (${formatPercent(fee.rate, 0, 2)})`;
	}
</script>

<p>{explanation}</p>
<table class="return-example-table">
	<tbody>
		<tr>
			<th scope="row"><strong>Capital in</strong></th>
			<td><strong>{formatDollar(example.capitalIn)}</strong></td>
		</tr>
		<tr>
			<th scope="row">Deposit fee</th>
			<td>{formatFee(example.depositFee)}</td>
		</tr>
		{#if (example.depositFee.rate ?? 0) > 0}
			<tr>
				<th scope="row">Capital invested</th>
				<td>{formatDollar(example.capitalInvested)}</td>
			</tr>
		{/if}
		<tr>
			<th scope="row">Annualised gross return</th>
			<td>{formatPercent(example.grossReturn.annualised, 0, 2)}</td>
		</tr>
		<tr>
			<th scope="row">Absolute gross return</th>
			<td>{formatPercent(example.grossReturn.absolute, 0, 2)}</td>
		</tr>
		<tr>
			<th scope="row">Gross capital at end</th>
			<td>{formatDollar(example.grossCapitalAtEnd)}</td>
		</tr>
		<tr>
			<th scope="row">Management fee</th>
			<td>{formatFee(example.managementFee)}</td>
		</tr>
		<tr>
			<th scope="row">Performance fee</th>
			<td>{formatFee(example.performanceFee)}</td>
		</tr>
		<tr>
			<th scope="row">Withdrawal fee</th>
			<td>{formatFee(example.withdrawalFee)}</td>
		</tr>
		<tr>
			<th scope="row"><strong>Capital out</strong></th>
			<td><strong>{formatDollar(example.capitalOut)}</strong></td>
		</tr>
		<tr>
			<th scope="row">Annualised net return</th>
			<td>{formatPercent(example.netReturn.annualised, 0, 2)}</td>
		</tr>
		<tr>
			<th scope="row">Absolute net return</th>
			<td>{formatPercent(example.netReturn.absolute, 0, 2)}</td>
		</tr>
		<tr>
			<th scope="row">Start date</th>
			<td>{formatDate(example.startDate)}</td>
		</tr>
		<tr>
			<th scope="row">End date</th>
			<td>{formatDate(example.endDate)}</td>
		</tr>
		<tr>
			<th scope="row">Days invested</th>
			<td>{formatNumber(example.daysInvested, 0, 0)}</td>
		</tr>
	</tbody>
</table>

<style>
	.return-example-table {
		width: 100%;
		margin-top: 0.75rem;
		border-collapse: collapse;

		th,
		td {
			padding: 0.25rem 0;
			border-bottom: 1px solid var(--c-box-3);
			vertical-align: top;
		}

		th {
			padding-right: 1rem;
			color: var(--c-text-light);
			font-weight: 500;
			text-align: left;
		}

		td {
			text-align: right;
		}

		tr:last-child :is(th, td) {
			border-bottom: 0;
		}
	}
</style>
