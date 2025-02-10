<script lang="ts">
	import type { DepositWizardData, DepositWizardDataSchema } from '../+layout';
	import { config } from '$lib/wallet/client';
	import { getWizardContext } from '$lib/wizard/state.svelte';
	import ShareBalances from '$lib/wallet/ShareBalances.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import Button from '$lib/components/Button.svelte';

	let { data } = $props();
	const { strategy, vault } = data;

	const wizard = getWizardContext<DepositWizardDataSchema>();
	const { transactionLogs } = wizard.data as Required<DepositWizardData>;

	const depositResult = vault.getDepositResult(config, transactionLogs);
</script>

<div class="deposit-success">
	<ShareBalances shares={depositResult.then((r) => r.shares)} value={depositResult.then((r) => r.assets)} />

	<p>
		Congratulations! You've successfully deposited in <strong>{strategy.name}</strong>. Keep an eye on your progress and
		returns. Please remember that participating in crypto / DeFi trading strategies carries significant risk. Click
		"Done" to return to the strategy.
	</p>

	{#if vault.requiresSettlement()}
		<Alert size="md" status="info" title="Note">
			{vault.label} vaults have a <i>settlement</i> phase. Your deposit will appear as <i>pending</i> until settled,
			after which you will be able to claim your shares.
			<Button slot="cta" size="xs" label="Learn more" href={vault.settlementInfoUrl} target="_blank" rel="noreferrer" />
		</Alert>
	{/if}
</div>

<style>
	.deposit-success {
		display: grid;
		gap: 1.5rem;
	}
</style>
