<script lang="ts">
	import type { Chain } from '$lib/helpers/chain';
	import type { StrategyRuntimeState } from 'trade-executor-frontend/strategy/runtimeState';
	import { fetchBalance, fetchToken, getContract, getProvider } from '@wagmi/core';
	import { ethers } from 'ethers';
	import { wallet } from '$lib/wallet/client';
	import { abi as fundValueCalculatorAbi } from '$lib/abi/enzyme/FundValueCalculator.json';
	import connectWizard from 'wizard/connect-wallet/store';
	import depositWizard from 'wizard/deposit/store';
	import { AlertList, AlertItem, Button, DataBox, Grid, SummaryBox } from '$lib/components';
	import TokenBalance from './TokenBalance.svelte';
	import WalletAddress from './WalletAddress.svelte';

	export let strategy: StrategyRuntimeState;
	export let chain: Chain;

	// FIXME: remove vault_usdc_payment_forwarder from TS_PUBLIC_STRATEGIES once it's added to on_chain_data
	$: contracts = {
		...strategy.on_chain_data.smart_contracts,
		vault_usdc_payment_forwarder: strategy.config.vault_usdc_payment_forwarder
	};

	async function getAccountNetValue({ vault, fund_value_calculator }: Contracts, account: Address) {
		const calculator = getContract({
			address: fund_value_calculator,
			abi: fundValueCalculatorAbi,
			signerOrProvider: getProvider()
		});

		const value = await calculator.callStatic.calcNetValueForSharesHolder(vault, account);
		const token = await fetchToken({ address: value.denominationAsset_ });

		return {
			decimals: token.decimals,
			formatted: ethers.utils.formatUnits(value.netValue_, token.decimals),
			symbol: token.symbol,
			value: value.netValue_
		};
	}

	function handleDepositClick() {
		depositWizard.init(`/strategies/${strategy.id}`, {
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
		{#if !(contracts.vault && contracts.fund_value_calculator)}
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
		<Button on:click={() => connectWizard.init(`/strategies/${strategy.id}`, { chainId: chain.chain_id })}>
			{$wallet.status === 'connected' ? 'Change wallet' : 'Connect wallet'}
		</Button>
		<Button label="Deposit" on:click={handleDepositClick} />
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
