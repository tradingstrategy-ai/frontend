<script lang="ts">
	import { wizard } from 'wizard/store';
	import { formatNumber } from '$lib/helpers/formatters.js';
	import { WalletInfo, WalletInfoItem } from '$lib/wallet';
	import { EntitySymbol } from '$lib/components';

	export let data;
	const { receivedAssets } = data;
	const { strategyName, shares } = $wizard.data;

	function sharesWithLabel(value: number) {
		const label = value === 1 ? 'share' : 'shares';
		return `${value} ${label}`;
	}
</script>

<div class="redemption-success">
	<h3>The following tokens have been added to your wallet</h3>

	<WalletInfo alignValues="right">
		{#each receivedAssets as { symbol, formatted }}
			<WalletInfoItem>
				<EntitySymbol slot="label" type="token" label={symbol} slug={symbol.toLowerCase()} />
				{formatNumber(formatted, 2, 4)}
			</WalletInfoItem>
		{/each}
	</WalletInfo>

	<p>
		Congratulations! You've successfully redeemed <strong>{sharesWithLabel(shares)}</strong> of
		<strong>{strategyName}</strong>. Click "Done" to return to the strategy.
	</p>
</div>

<style>
	.redemption-success {
		display: grid;
		gap: var(--space-md);
	}

	h3 {
		color: hsla(var(--hsl-text-light));
		font: var(--f-ui-lg-medium);
	}
</style>
