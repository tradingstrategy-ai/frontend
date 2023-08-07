<script lang="ts">
	import { formatNumber } from '$lib/helpers/formatters.js';
	import { WalletInfo, WalletInfoItem } from '$lib/wallet';
	import { Button, EntitySymbol, WizardActions } from '$lib/components';

	export let data;
	const { receivedAssets, wizard } = data;
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
				{formatNumber(Number(formatted), 2, 4)}
			</WalletInfoItem>
		{/each}
	</WalletInfo>

	<p>
		Congratulations! You've successfully redeemed <strong>{sharesWithLabel(shares)}</strong> of
		<strong>{strategyName}</strong>. Click "Done" to return to the strategy.
	</p>
</div>

<WizardActions>
	<Button secondary label="Back" href="shares-redemption" />
	<Button label="Done" href={$wizard.returnTo} />
</WizardActions>

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
