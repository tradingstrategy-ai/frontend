<script lang="ts">
	import type { TradingPositionInfo } from 'trade-executor/models/position-info';
	import { positionTooltips } from 'trade-executor/models/position-tooltips';
	import Alert from '$lib/components/Alert.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import {
		formatDuration,
		formatPercent,
		formatPrice,
		formatTokenAmount,
		isNumber,
		notFilledMarker
	} from '$lib/helpers/formatters';
	import { getProfitInfo } from '$lib/components/Profitability.svelte';
	import IconInfo from '~icons/local/info';
	import IconWarning from '~icons/local/warning';

	type Props = {
		position: TradingPositionInfo;
	};

	let { position }: Props = $props();

	const VALUE_REALIZATION_GAP_THRESHOLD = 0.01;

	let currentPrice = $derived(position.stillOpen ? position.currentPrice : position.closePrice);
	let currentQuantity = $derived(position.stillOpen ? position.currentQuantity : position.quantityAtClose);
	let currentValue = $derived(position.stillOpen ? position.currentValue : position.valueAtClose);

	const changeOptions: Intl.NumberFormatOptions = { signDisplay: 'exceptZero' };
</script>

<div class="position-summary">
	<h2>Position Summary</h2>

	<table class="metrics-table">
		<thead>
			<tr>
				<th></th>
				<th>Open</th>
				<th>
					{position.stillOpen ? 'Latest' : 'Close'}
				</th>
				<th>𝚫</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>Time</td>
				<td>
					<Tooltip>
						<span slot="trigger" class="underline">
							<Timestamp date={position.opened_at} withTime />
						</span>
						<span slot="popup">
							{positionTooltips.opened_at}
						</span>
					</Tooltip>
				</td>
				<td>
					{#if position.stillOpen}
						currently open
					{:else}
						<Tooltip>
							<span slot="trigger" class="underline">
								<Timestamp date={position.closed_at} withTime />
							</span>
							<span slot="popup">
								{positionTooltips.closed_at}
							</span>
						</Tooltip>
					{/if}
				</td>
				<td>
					<Tooltip>
						<span slot="trigger" class="underline">
							+{formatDuration(position.durationSeconds)}
						</span>
						<span slot="popup">
							{positionTooltips.durationSeconds}
						</span>
					</Tooltip>
				</td>
			</tr>

			<tr>
				<td>Quantity</td>
				<td>
					<Tooltip>
						<span slot="trigger" class="underline">
							{formatTokenAmount(position.quantityAtOpen)}
							{position.pair.actionSymbol}
						</span>
						<span slot="popup">
							{positionTooltips.quantityAtOpen}
						</span>
					</Tooltip>
				</td>
				<td>
					<Tooltip>
						<span slot="trigger" class="underline">
							{formatTokenAmount(currentQuantity)}
							{position.pair.actionSymbol}
						</span>
						<span slot="popup">
							{position.stillOpen ? positionTooltips.currentQuantity : positionTooltips.quantityAtClose}
						</span>
					</Tooltip>
				</td>
				<td>
					{#if currentQuantity}
						{formatTokenAmount(currentQuantity - position.quantityAtOpen, undefined, undefined, changeOptions)}
					{:else}
						{notFilledMarker}
					{/if}
					{position.pair.actionSymbol}
				</td>
			</tr>

			{#if position.isCreditPosition}
				<tr>
					<td>Interest rate</td>
					<td>
						<Tooltip>
							<span slot="trigger" class="underline">
								{formatPercent(position.interestRateAtOpen)}
							</span>
							<span slot="popup">
								{positionTooltips.interestRateAtOpen}
							</span>
						</Tooltip>
					</td>
					<td>
						<Tooltip>
							<span slot="trigger" class="underline">
								{#if position.stillOpen}
									{formatPercent(position.currentInterestRate)}
								{:else}
									N/A
								{/if}
							</span>
							<span slot="popup">
								{position.stillOpen ? positionTooltops.currentInterestRate : positionTooltips.interestRateAtClose}
							</span>
						</Tooltip>
					</td>
					<td>
						{#if position.stillOpen && isNumber(position.currentInterestRate) && isNumber(position.interestRateAtOpen)}
							{formatPercent(
								position.currentInterestRate - position.interestRateAtOpen,
								undefined,
								undefined,
								changeOptions
							)}
						{:else}
							{notFilledMarker}
						{/if}
					</td>
				</tr>
			{:else}
				<tr>
					<td>Price</td>
					<td>
						<Tooltip>
							<span slot="trigger" class="underline">
								{formatPrice(position.openPrice)}
							</span>
							<span slot="popup">
								{positionTooltips.openPrice}
							</span>
						</Tooltip>
					</td>
					<td>
						<Tooltip>
							<span slot="trigger" class="underline">
								{formatPrice(currentPrice)}
							</span>
							<span slot="popup">
								{position.stillOpen ? positionTooltips.currentPrice : positionTooltips.closePrice}
							</span>
						</Tooltip>
					</td>
					<td>
						{#if isNumber(currentPrice) && isNumber(position.openPrice)}
							{formatPrice(currentPrice - position.openPrice, undefined, undefined, changeOptions)}
						{:else}
							{notFilledMarker}
						{/if}
					</td>
				</tr>
			{/if}

			<tr>
				<td>Value</td>
				<td>
					<Tooltip>
						<span slot="trigger" class="underline">
							{formatPrice(position.valueAtOpen)}
						</span>
						<span slot="popup">
							{positionTooltips.valueAtOpen}
						</span>
					</Tooltip>
				</td>
				<td>
					<Tooltip>
						<span slot="trigger" class="underline">
							{formatPrice(currentValue)}
						</span>
						<span slot="popup">
							{position.stillOpen ? positionTooltips.currentValue : positionTooltips.valueAtClose}
						</span>
					</Tooltip>
					<!-- value realization gap info/warning icon and tooltip -->
					{#if position.stillOpen && !position.isCreditPosition}
						{@const { value, formatted, direction } = getProfitInfo(position.valueRealizationGap)}
						{@const exceedsThreshold = -(value ?? 0) > VALUE_REALIZATION_GAP_THRESHOLD}
						<span class={['value-realization-gap', exceedsThreshold && 'warning']}>
							<Tooltip>
								<svelte:fragment slot="trigger">
									{#if exceedsThreshold}<IconWarning />{:else}<IconInfo />{/if}
								</svelte:fragment>
								<div slot="popup">
									{#if exceedsThreshold}
										<Alert size="xs" status="warning">
											This position has a <strong>high value realisation gap</strong> of
											<strong>{formatted}</strong>.
										</Alert>
									{/if}
									<p>
										The <strong>theoretical value</strong> (quantity ✕ mid price) is
										<strong>{formatPrice(position.nominalValue)}</strong>
									</p>
									<p>
										The <strong>realisable value</strong> based on the estimated execution price is
										<strong>{formatPrice(position.currentValue)}</strong>,
										{#if direction}
											<strong>
												{formatted}
												{direction < 1 ? 'lower than' : 'higher than'}
											</strong>
											than the theoretical value.
										{:else}
											equal to (or very close to) the theoretical value.
										{/if}
									</p>
								</div>
							</Tooltip>
						</span>
					{/if}
				</td>
				<td>
					{#if position.multitrade}
						<Tooltip>
							<span slot="trigger" class="underline">N/A</span>
							<span slot="popup">𝚫 Value not currently available for multitrade positions.</span>
						</Tooltip>
					{:else if currentValue}
						{formatPrice(currentValue - position.valueAtOpen, undefined, undefined, changeOptions)}
					{:else}
						{notFilledMarker}
					{/if}
				</td>
			</tr>
		</tbody>
	</table>
</div>

<style>
	.position-summary {
		h2 {
			font: var(--f-heading-md-medium);
		}

		.value-realization-gap {
			position: absolute;
			margin-left: 0.5rem;
			--icon-color: var(--c-text-light);

			&.warning {
				--icon-color: var(--c-warning);
			}

			p {
				margin: 0;
			}

			[slot='popup'] {
				display: grid;
				gap: 1em;
				min-width: 30rem;
			}

			@media (--viewport-md-up) {
				:global(.popup) {
					left: -10rem;
				}
			}
		}
	}
</style>
