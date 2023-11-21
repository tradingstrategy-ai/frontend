<script lang="ts">
	import { switchNetwork } from '@wagmi/core';
	import type { ApiChain } from '$lib/helpers/chain';
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { wizard } from 'wizard/store';
	import { wallet, VaultBalance, WalletAddress, WrongNetwork } from '$lib/wallet';
	import { Alert, Button, Icon } from '$lib/components';
	import { goto } from '$app/navigation';

	export let strategy: StrategyRuntimeState;
	export let chain: ApiChain;

	$: contracts = strategy.on_chain_data.smart_contracts;
	$: depositEnabled = [
		contracts.vault,
		contracts.comptroller,
		contracts.payment_forwarder,
		contracts.fund_value_calculator
	].every(Boolean);

	$: connected = $wallet.status === 'connected';
	$: wrongNetwork = connected && $wallet.chain?.id !== chain.chain_id;

	function launchWizard(slug: string) {
		wizard.init(slug, `/strategies/${strategy.id}`, {
			chainId: chain.chain_id,
			strategyName: strategy.name,
			contracts
		});
		goto(`/wizard/${slug}/introduction`);
	}
</script>

<div class="my-deposits" class:connected>
	<h2>My deposits</h2>
	{#if depositEnabled}
		<div class="content">
			{#if !connected}
				<div class="not-connected">
					<strong>Wallet not connected.</strong> Please connect wallet to see your deposit status.
				</div>
			{:else if wrongNetwork}
				<WrongNetwork size="sm" hideButton chainId={chain.chain_id} chainName={chain.chain_name} />
			{:else}
				Balances coming soon
				<!-- <VaultBalance {contracts} address={$wallet.address} /> -->
			{/if}
		</div>
		{#if !connected}
			<Button on:click={() => launchWizard('connect-wallet')}>
				<Icon slot="icon" name="wallet" --icon-size="1em" />
				Connect wallet
			</Button>
		{/if}
		<div class="actions">
			{#if wrongNetwork}
				<Button label="Switch network" on:click={() => switchNetwork({ chainId: chain.chain_id })} />
			{:else}
				<Button label="Deposit" on:click={() => launchWizard('deposit')} />
				<Button secondary label="Redeem" on:click={() => launchWizard('redeem')} />
			{/if}
		</div>
	{:else}
		<Alert status="info" size="md" title="Deposits not available">
			This strategy is not using smart contract-based capital management and is not accepting external investments.
		</Alert>
	{/if}
</div>

<style lang="postcss">
	.my-deposits {
		display: grid;
		grid-template-rows: auto 1fr;
		gap: 1rem;
		border: 1px solid hsl(var(--hsl-text-light));
		border-radius: var(--radius-md);
		padding: 1.25rem;
	}

	h2 {
		font: var(--f-heading-xs-medium);
		font-size: 1rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: hsl(var(--hsl-text-ultra-light));

		@media (--viewport-sm-down) {
			font-size: 0.875rem;
		}
	}

	.content {
		font: var(--f-ui-md-roman);
		letter-spacing: var(--f-ui-md-spacing, normal);
	}

	.actions {
		display: grid;
		gap: inherit;
		grid-template-columns: 1fr 1fr;

		.connected & {
			grid-template-columns: 1fr;
		}

		@media (--viewport-sm-down) {
			grid-template-columns: 1fr;
		}
	}
</style>
