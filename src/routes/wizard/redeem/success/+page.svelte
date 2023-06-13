<script lang="ts">
	import wizard from '../store';
	import { WalletInfo, WalletInfoItem } from '$lib/wallet';
	import { Button, EntitySymbol, WizardActions } from '$lib/components';
</script>

<div class="redemption-success">
	<h3>The following tokens have been added to your wallet</h3>

	<WalletInfo alignValues="right">
		<WalletInfoItem>
			<EntitySymbol slot="label" type="token" label="USDC" slug="usdc" />
			1200
		</WalletInfoItem>
	</WalletInfo>
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
