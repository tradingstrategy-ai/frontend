<script lang="ts">
	import { formatInterestRate } from '$lib/helpers/formatters';
	import { lendingReserveUrl } from '$lib/helpers/lending-reserve';

	export let reserve: any;

	$: reserveUrl = lendingReserveUrl(reserve.chain_slug, reserve.protocol_slug, reserve.asset_address);
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
		<strong>{formatInterestRate(reserve.additional_details.variable_borrow_apr_latest)}</strong>
		and the <strong>supply APR</strong> is currently
		<strong>{formatInterestRate(reserve.additional_details.supply_apr_latest)}</strong>.
	</p>

	<p>
		Additional information is available on the
		<a href={reserveUrl} target="_blank" rel="noreferrer">{reserve.protocol_name} – {reserve.asset_name}</a>
		lending reserve page.
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
