<script lang="ts">
	import type { RedeemWizardDataSchema } from '../+layout.js';
	import { getWizardContext } from '$lib/wizard/state.svelte';

	const { data } = $props();
	const { strategy, denominationToken, vault } = data;

	const wizard = getWizardContext<RedeemWizardDataSchema>();

	const inKind = vault.inKindRedemption;
	const requiresSettlement = vault.requiresSettlement();

	wizard.toggleComplete('introduction');
</script>

<div class="deposit-introduction">
	<p>
		Ready to redeem shares of <strong>{strategy.name}</strong>?

		{#if requiresSettlement}
			Upon initiating redemption, your request will enter a settlement period. Once settled, you'll be able to claim
			your relative share
		{:else}
			Upon redemption, you'll receive your relative share
		{/if}

		{#if inKind}
			of <strong>{denominationToken.label}</strong> and any tokens the strategy is currently invested in.
		{:else}
			value in <strong>{denominationToken.label}</strong>.
		{/if}

		Connect your wallet, review your share balance, enter your desired redemption amount, and

		{#if requiresSettlement}
			initiate your redemption.
		{:else}
			complete your transaction.
		{/if}

		Let's get started!
	</p>
</div>
