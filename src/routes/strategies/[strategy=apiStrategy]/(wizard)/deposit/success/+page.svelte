<script lang="ts">
	import type { DepositWizardData, DepositWizardDataSchema } from '../+layout';
	import { config } from '$lib/wallet/client';
	import { getWizardContext } from '$lib/wizard/state.svelte';
	import ShareBalances from '$lib/wallet/ShareBalances.svelte';
	import Alert from '$lib/components/Alert.svelte';

	let { data } = $props();
	let { strategy, vault } = $derived(data);

	const wizard = getWizardContext<DepositWizardDataSchema>();
	const { transactionLogs } = wizard.data as Required<DepositWizardData>;

	let requiresSettlement = $derived(vault.requiresSettlement());
	let depositResult = $derived(vault.getDepositResult(config, transactionLogs));
</script>

<div class="deposit-success">
	<ShareBalances shares={depositResult.then((r) => r.shares)} value={depositResult.then((r) => r.assets)} />

	<p>
		Congratulations! You've
		{requiresSettlement ? 'initiated a deposit' : 'successfully deposited'}
		into <strong>{strategy.name}</strong>. Keep an eye on your progress and returns. Please remember that participating
		in crypto / DeFi trading strategies carries significant risk. Click "Done" to return to the strategy.
	</p>

	{#if requiresSettlement}
		<Alert size="sm" status="info" title="Settlement in progress">
			Your deposit is now <i>pending</i>. Once settlement is complete, you'll be able to claim your deposited shares.
			<a href={vault.settlementInfoUrl} target="_blank" rel="noreferrer">Learn more about settlement</a>
		</Alert>
	{/if}
</div>

<style>
	.deposit-success {
		display: grid;
		gap: 1.5rem;
	}
</style>
