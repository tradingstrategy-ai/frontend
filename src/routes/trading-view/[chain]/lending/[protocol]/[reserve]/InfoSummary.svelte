<script lang="ts">
	import { formatDollar, formatInterestRate } from '$lib/helpers/formatters';
	import { SECONDS_PER_DAY, compoundInterest } from '$lib/helpers/lending-reserve';

	export let reserve: any;

	$: details = reserve.additional_details;

	$: examplePrincipal = 5000;
	$: exampleInterest = compoundInterest(examplePrincipal, details.variable_borrow_apr_latest / 100, SECONDS_PER_DAY);
</script>

<div class="summary">
	<p>
		The asset token
		<a href="/trading-view/{reserve.chain_slug}/tokens/{reserve.asset_address}">{reserve.asset_name}</a>, which trades
		as <strong>{reserve.asset_symbol}</strong> on
		<a href="/trading-view/{reserve.chain_slug}">{reserve.chain_name}</a>, is available to borrow as an
		<strong>{reserve.protocol_name}</strong> lending reserve.
	</p>

	<p>
		The <strong>variable borrow APR</strong> is currently
		<strong>{formatInterestRate(details.variable_borrow_apr_latest)}</strong>
		and the <strong>supply APR</strong> is currently
		<strong>{formatInterestRate(details.supply_apr_latest)}</strong>.
	</p>

	<p>
		At the current variable borrow rate, the cost of borrowing
		<strong>${examplePrincipal.toLocaleString('en')} USD</strong> worth of
		<strong>{reserve.asset_symbol}</strong> is approximately
		<strong>{formatDollar(exampleInterest)} / 24h</strong>.
	</p>
</div>

<style lang="postcss">
	.summary {
		display: grid;
		font: var(--f-ui-large-roman);
		gap: 1.4em;
	}

	p {
		font: inherit;
	}

	strong {
		font-weight: 700;
	}

	a {
		font-weight: 700;
		text-decoration: underline;
	}
</style>
