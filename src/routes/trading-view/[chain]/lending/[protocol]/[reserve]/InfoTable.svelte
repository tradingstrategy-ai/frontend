<script lang="ts">
	import { Tooltip, TradingDataInfo, TradingDataInfoRow } from '$lib/components';
	import type { LendingReserve } from '$lib/explorer/lending-reserve-client';
	import { getFormattedReserveUSD } from '$lib/helpers/lending-reserve';
	import { formatDollar, formatPercent, formatInterestRate } from '$lib/helpers/formatters';

	export let reserve: LendingReserve;
	export let borrowable: boolean;

	$: details = reserve.additional_details;
	$: formattedReserveUSD = getFormattedReserveUSD(reserve);
</script>

<TradingDataInfo>
	<TradingDataInfoRow value="{formatInterestRate(details.supply_apr_latest)} APR">
		<Tooltip slot="label">
			<span slot="trigger" class="underline">Supply rate</span>
			<div slot="popup">APR earned when depositing tokens to this reserve for lending.</div>
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
					<div slot="popup">This reserve is not borrowable.</div>
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
			{#if !borrowable}
				<Tooltip>
					<span slot="trigger" class="underline">N/A</span>
					<div slot="popup">This reserve is not borrowable.</div>
				</Tooltip>
			{:else if formattedReserveUSD?.stableBorrowRateEnabled === false}
				<Tooltip>
					<span slot="trigger" class="underline">N/A</span>
					<div slot="popup">Stable borrow rate is not enabled for this reserve.</div>
				</Tooltip>
			{:else}
				{formatInterestRate(details.stable_borrow_apr_latest)} APR
			{/if}
		</svelte:fragment>
	</TradingDataInfoRow>

	{#if formattedReserveUSD}
		<TradingDataInfoRow>
			<Tooltip slot="label">
				<span slot="trigger" class="underline">Total supplied</span>
				<div slot="popup">
					Value of tokens currently deposited compared to the supply cap (maximum amount that can be supplied).
				</div>
			</Tooltip>
			<svelte:fragment slot="value">
				{formatDollar(formattedReserveUSD.totalLiquidityUSD)}
				<span class="light">of</span>
				{formatDollar(formattedReserveUSD.supplyCapUSD)}
			</svelte:fragment>
		</TradingDataInfoRow>

		<TradingDataInfoRow>
			<Tooltip slot="label">
				<span slot="trigger" class="underline">Total borrowed</span>
				<div slot="popup">
					Value of tokens currently borrowed compared to the borrow cap (maximum amount that can be borrowed).
				</div>
			</Tooltip>
			<svelte:fragment slot="value">
				{#if borrowable}
					{formatDollar(formattedReserveUSD.totalDebtUSD)}
					<span class="light">of</span>
					{formatDollar(formattedReserveUSD.borrowCapUSD)}
				{:else}
					<Tooltip>
						<span slot="trigger" class="underline">N/A</span>
						<div slot="popup">This reserve is not borrowable.</div>
					</Tooltip>
				{/if}
			</svelte:fragment>
		</TradingDataInfoRow>

		<TradingDataInfoRow>
			<Tooltip slot="label">
				<span slot="trigger" class="underline">Utilization Rate</span>
				<div slot="popup">Portion of reserve's supply that is currently being utilized by borrowers.</div>
			</Tooltip>
			<svelte:fragment slot="value">
				{#if borrowable}
					{formatPercent(formattedReserveUSD.supplyUsageRatio)}
				{:else}
					<Tooltip>
						<span slot="trigger" class="underline">N/A</span>
						<div slot="popup">This reserve is not borrowable.</div>
					</Tooltip>
				{/if}
			</svelte:fragment>
		</TradingDataInfoRow>
	{/if}

	<TradingDataInfoRow label="Protocol" value={reserve.protocol_name} />

	<TradingDataInfoRow>
		<Tooltip slot="label">
			<span slot="trigger" class="underline">Asset Token</span>
			<div slot="popup">Underlying asset token to be supplied or borrowed.</div>
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

	.light {
		font-weight: 400;
	}
</style>
