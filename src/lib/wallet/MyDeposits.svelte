<script lang="ts">
	import type { ApiChain } from '$lib/helpers/chain';
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { goto } from '$app/navigation';
	import { switchNetwork } from '@wagmi/core';
	import { wizard } from 'wizard/store';
	import { wallet, DepositBalance, VaultBalance, WrongNetwork } from '$lib/wallet';
	import { Alert, Button, Icon } from '$lib/components';

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
				<div class="not-connected-warning">
					<Icon name="warning" />
					<strong>Wallet not connected</strong>
				</div>
				<p>Please connect wallet to see your deposit status.</p>
			{:else if wrongNetwork}
				<WrongNetwork size="sm" hideButton chainId={chain.chain_id} chainName={chain.chain_name} />
			{:else}
				<dl class="balances">
					<VaultBalance {contracts} address={$wallet.address} let:shares let:value>
						<DepositBalance label="Value" data={value} dollar />
						<DepositBalance label="Shares" data={shares} />
					</VaultBalance>
				</dl>
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
		display: grid;
		align-items: flex-start;
		font: var(--f-ui-md-roman);
		letter-spacing: var(--f-ui-md-spacing, normal);
	}

	.not-connected-warning {
		display: flex;
		gap: 0.5ch;
		align-items: center;
	}

	.balances {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-self: center;
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
