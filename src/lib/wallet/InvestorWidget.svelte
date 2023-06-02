<script lang="ts">
	import type { Chain } from '$lib/helpers/chain';
	import type { Wizard } from 'wizard/store';
	import type { StrategyRuntimeState } from 'trade-executor-frontend/strategy/runtimeState';
	import { fetchBalance, fetchToken, prepareWriteContract } from '@wagmi/core';
	import { formatUnits } from 'viem';
	import { wallet } from '$lib/wallet/client';
	import fundValueCalculatorABI from '$lib/eth-defi/abi/enzyme/FundValueCalculator.json';
	import connectWizard from 'wizard/connect-wallet/store';
	import depositWizard from 'wizard/deposit/store';
	import { AlertList, AlertItem, Button, DataBox, Grid, SummaryBox } from '$lib/components';
	import TokenBalance from './TokenBalance.svelte';
	import WalletAddress from './WalletAddress.svelte';

	export let strategy: StrategyRuntimeState;
	export let chain: Chain;

	$: contracts = strategy.on_chain_data.smart_contracts;
	$: depositEnabled = ['vault', 'comptroller', 'payment_forwarder', 'fund_value_calculator'].every(
		(c: string) => c in contracts
	);

	async function getAccountNetValue({ vault, fund_value_calculator }: Contracts, account: Address) {
		const { result } = await prepareWriteContract({
			address: fund_value_calculator,
			abi: fundValueCalculatorABI,
			functionName: 'calcNetValueForSharesHolder',
			args: [vault, account]
		});

		const [address, value] = result as [Address, bigint];
		const { decimals, symbol } = await fetchToken({ address });

		return { decimals, symbol, value, formatted: formatUnits(value, decimals) };
	}

	function launchWizard(wizard: Wizard) {
		wizard.init(`/strategies/${strategy.id}`, {
			chainId: chain.chain_id,
			strategyName: strategy.name,
			contracts
		});
	}
</script>

<SummaryBox title="Invest" ctaPosition="top">
	<svelte:fragment slot="cta">
		{#if $wallet.status === 'connected'}
			<WalletAddress wallet={$wallet} />
		{/if}
	</svelte:fragment>
	<div class="content">
		{#if !depositEnabled}
			<AlertList status="info" size="md">
				<AlertItem>Depositing is not currently available for this strategy.</AlertItem>
			</AlertList>
		{:else if $wallet.status !== 'connected'}
			<AlertList status="warning" size="md">
				<AlertItem title="Wallet not connected">Please connect wallet to see your deposit status</AlertItem>
			</AlertList>
		{:else if $wallet.chain.id !== chain.chain_id}
			<AlertList status="error" size="md">
				<AlertItem title="Wrong network">Please connnect to {chain.chain_name}</AlertItem>
			</AlertList>
		{:else}
			<Grid cols={2} gap="lg">
				<DataBox label="Number of shares">
					<TokenBalance data={fetchBalance({ token: contracts.vault, address: $wallet.address })} />
				</DataBox>
				<DataBox label="Value of shares">
					<TokenBalance data={getAccountNetValue(contracts, $wallet.address)} />
				</DataBox>
			</Grid>
		{/if}
	</div>
	<div class="actions">
		<Button on:click={() => launchWizard(connectWizard)}>
			{$wallet.status === 'connected' ? 'Change wallet' : 'Connect wallet'}
		</Button>
		<Button label="Deposit" disabled={!depositEnabled} on:click={() => launchWizard(depositWizard)} />
		<Button label="Redeem" disabled />
	</div>
</SummaryBox>

<style lang="postcss">
	.actions {
		display: grid;
		gap: var(--space-ml);
		grid-template-columns: repeat(3, 1fr);
		@media (--viewport-sm-down) {
			grid-template-columns: 1fr;
		}
	}
</style>
