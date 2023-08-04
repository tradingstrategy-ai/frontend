<script lang="ts">
	import { Tooltip, TradingDataInfo, TradingDataInfoRow } from '$lib/components';
	import type { LendingReserve } from '$lib/explorer/lending-reserve-client';
	import { formatInterestRate } from '$lib/helpers/formatters';

	export let reserve: LendingReserve;
	export let borrowable: boolean;

	$: details = reserve.additional_details;
</script>

<TradingDataInfo>
	<TradingDataInfoRow value="{formatInterestRate(details.supply_apr_latest)} APR">
		<Tooltip slot="label">
			<span slot="trigger" class="underline">Supply rate</span>
			<div slot="popup">APR earned when supplying this token as collateral</div>
		</Tooltip>
	</TradingDataInfoRow>
	<TradingDataInfoRow>
		<Tooltip slot="label">
			<span slot="trigger" class="underline">Borrow rate – variable</span>
			<div slot="popup">
				APR paid when borrowing this token using the reserve's <em>variable rate</em>. This is based on the offer and
				demand in {reserve.protocol_name}. This rate will fluctuate over time and could be the optimal rate depending on
				market conditions.
			</div>
		</Tooltip>

		<svelte:fragment slot="value">
			{#if borrowable}
				{formatInterestRate(details.variable_borrow_apr_latest)} APR
			{:else}
				<Tooltip>
					<span slot="trigger" class="underline">N/A</span>
					<div slot="popup">This reserve is not currently borrowable.</div>
				</Tooltip>
			{/if}
		</svelte:fragment>
	</TradingDataInfoRow>
	<TradingDataInfoRow>
		<Tooltip slot="label">
			<span slot="trigger" class="underline">Borrow rate – stable</span>
			<div slot="popup">
				APR paid when borrowing this token using the reserve's <em>stable rate</em>. Stable rates act as a fixed rate in
				the short-term, but can be re-balanced in the long-term in response to changes in market conditions.
			</div>
		</Tooltip>

		<svelte:fragment slot="value">
			{#if borrowable}
				{formatInterestRate(details.stable_borrow_apr_latest)} APR
			{:else}
				<Tooltip>
					<span slot="trigger" class="underline">N/A</span>
					<div slot="popup">This reserve is not currently borrowable.</div>
				</Tooltip>
			{/if}
		</svelte:fragment>
	</TradingDataInfoRow>
	<TradingDataInfoRow label="Protocol" value={reserve.protocol_name} />
	<TradingDataInfoRow>
		<Tooltip slot="label">
			<span slot="trigger" class="underline">Asset Token</span>
			<div slot="popup">Underlying asset token to be supplied as collateral and/or borrowed.</div>
		</Tooltip>

		<a slot="value" href="/trading-view/{reserve.chain_slug}/tokens/{reserve.asset_address}">
			{reserve.asset_name}
		</a>
	</TradingDataInfoRow>
	<TradingDataInfoRow label="Blockchain">
		<a slot="value" href="/trading-view/{reserve.chain_slug}">{reserve.chain_name}</a>
	</TradingDataInfoRow>
</TradingDataInfo>

<style lang="postcss">
	div[slot='popup'] {
		max-width: 25rem;
	}
</style>
