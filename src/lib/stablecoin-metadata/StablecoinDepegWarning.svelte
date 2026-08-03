<!--
@component
Displays a prominent warning on a stablecoin detail page when the denomination
is likely below its native fiat peg, or when its price feed is unavailable.

@example

```svelte
	<StablecoinDepegWarning metadata={stablecoinMetadata} />
```
-->
<script lang="ts">
	import Alert from '$lib/components/Alert.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import { getStablecoinNativeRate, isStablecoinDepegged } from './helpers';
	import type { StablecoinMetadata } from './schemas';

	interface Props {
		metadata: StablecoinMetadata;
	}

	let { metadata }: Props = $props();

	let depegged = $derived(isStablecoinDepegged(metadata));
	let priceFeedUnavailable = $derived(metadata.rate_fetch_failed_reason === 'missing_coingecko_id');
	let nativeRate = $derived(getStablecoinNativeRate(metadata));
	let pegCurrency = $derived((metadata.peg_rate_currency ?? 'usd').toUpperCase());
	let rateTimestamp = $derived(metadata.usd_rate_fetched_at ?? metadata.usd_rate_updated_at);
	let unitsPerFiat = $derived(nativeRate === undefined ? undefined : 1 / nativeRate);
	let formattedUnitsPerFiat = $derived.by(() => {
		if (unitsPerFiat === undefined || !Number.isFinite(unitsPerFiat)) return undefined;

		return new Intl.NumberFormat('en', { maximumSignificantDigits: 6 }).format(unitsPerFiat);
	});
</script>

{#if priceFeedUnavailable || depegged}
	<div
		class="stablecoin-depeg-warning"
		data-testid={priceFeedUnavailable ? 'stablecoin-price-feed-warning' : 'stablecoin-depeg-warning'}
	>
		{#if priceFeedUnavailable}
			<Alert status="warning" size="md">
				This stablecoin does not have a price feed available at the moment and we are unable to display peg/depeg rates.
			</Alert>
		{:else}
			<Alert status="error" size="md">
				This stablecoin is likely depegged.
				{#if formattedUnitsPerFiat}
					The current rate is {formattedUnitsPerFiat}
					{metadata.symbol} / 1 {pegCurrency}
					{#if rateTimestamp}
						fetched at
						<Timestamp date={rateTimestamp} withTime />.
					{:else}.
					{/if}
				{:else}
					The current rate is unavailable.
				{/if}
			</Alert>
		{/if}
	</div>
{/if}

<style>
	.stablecoin-depeg-warning {
		margin-top: 1rem;
	}
</style>
