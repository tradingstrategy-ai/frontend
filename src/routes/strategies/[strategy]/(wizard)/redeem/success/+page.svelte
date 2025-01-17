<script lang="ts">
	import type { RedeemWizardData } from '../+layout';
	import { EntitySymbol } from '$lib/components';
	import WalletInfo from '$lib/wallet/WalletInfo.svelte';
	import WalletInfoItem from '$lib/wallet/WalletInfoItem.svelte';
	import { formatBalance } from '$lib/eth-defi/helpers';
	import { formatNumber } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	let { data } = $props();
	const { wizard, strategy, receivedAssets } = data;
	const { shares } = $wizard.data as RedeemWizardData;

	function sharesWithLabel(value: Numberlike) {
		const label = Number(value) === 1 ? 'share' : 'shares';
		return `${formatNumber(value, 2, 5)} ${label}`;
	}
</script>

<div class="redemption-success">
	<h3>The following tokens have been added to your wallet</h3>

	<WalletInfo alignValues="right">
		{#each receivedAssets as balance}
			{@const { symbol, label } = balance}
			<WalletInfoItem>
				<EntitySymbol slot="label" size="1.5rem" {label} logoUrl={getLogoUrl('token', symbol)} />
				{formatBalance(balance, 2, 4)}
			</WalletInfoItem>
		{/each}
	</WalletInfo>

	<p>
		Congratulations! You've successfully redeemed <strong>{sharesWithLabel(shares)}</strong> of
		<strong>{strategy.name}</strong>. Click "Done" to return to the strategy.
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
