<script lang="ts">
	import { wizard } from 'wizard/store';
	import { formatNumber } from '$lib/helpers/formatters.js';
	import { WalletInfo, WalletInfoItem } from '$lib/wallet';
	import { EntitySymbol } from '$lib/components';
	import { formatBalance } from '$lib/eth-defi/helpers.js';

	export let data;
	const { receivedAssets } = data;
	const { strategyName, shares } = $wizard.data!;

	function sharesWithLabel(value: number) {
		const label = value === 1 ? 'share' : 'shares';
		return `${value} ${label}`;
	}
</script>

<div class="redemption-success">
	<h3>The following tokens have been added to your wallet</h3>

	<WalletInfo alignValues="right">
		{#each receivedAssets as balance}
			{@const { symbol } = balance}
			<WalletInfoItem>
				<EntitySymbol slot="label" type="token" label={symbol} slug={symbol.toLowerCase()} />
				{formatBalance(balance, 2, 4)}
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
		color: var(--c-text-light);
		font: var(--f-ui-lg-medium);
	}
</style>
