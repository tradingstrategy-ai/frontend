<script lang="ts">
	import type { ApiChain } from '$lib/helpers/chain';
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { goto } from '$app/navigation';
	import { switchNetwork } from '@wagmi/core';
	import { wizard } from 'wizard/store';
	import { wallet, DepositBalance, DepositWarning, VaultBalance } from '$lib/wallet';
	import { Button, Icon } from '$lib/components';

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
	$: buttonsDisabled = !depositEnabled || wrongNetwork;

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
	{#if !depositEnabled}
		<DepositWarning title="Deposits not enabled">
			This strategy is not using smart contract-based capital management and is not accepting external investments.
		</DepositWarning>
	{:else if !connected}
		<DepositWarning title="Wallet not connected">Please connect wallet to see your deposit status.</DepositWarning>
	{:else if wrongNetwork}
		<DepositWarning title="Wrong network">
			Please connect to {chain.chain_name}.
		</DepositWarning>
	{:else}
		<dl class="balances">
			<VaultBalance {contracts} address={$wallet.address} let:shares let:value>
				<DepositBalance label="Value" data={value} dollar />
				<DepositBalance label="Shares" data={shares} />
			</VaultBalance>
		</dl>
	{/if}
	<div class="actions">
		{#if depositEnabled && !connected}
			<Button class="full-width" on:click={() => launchWizard('connect-wallet')}>
				<Icon slot="icon" name="wallet" --icon-size="1.25em" />
				Connect wallet
			</Button>
		{:else if depositEnabled && wrongNetwork}
			<Button class="full-width" label="Switch network" on:click={() => switchNetwork({ chainId: chain.chain_id })} />
		{/if}
		<Button label="Deposit" disabled={buttonsDisabled} on:click={() => launchWizard('deposit')} />
		<Button secondary label="Redeem" disabled={buttonsDisabled} on:click={() => launchWizard('redeem')} />
	</div>
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

	.balances {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-self: center;
	}

	.actions {
		display: grid;
		gap: inherit;
		grid-template-columns: 1fr 1fr;

		/* desktop: normally buttons span both cols */
		:global(.button) {
			grid-column: 1 / -1;
		}

		/* desktop: if 2-col button is present, siblings should span single col */
		:global(.full-width ~ .button) {
			grid-column: auto;
		}

		/* mobile: non 2-col buttons always span single col on mobile */
		@media (--viewport-sm-down) {
			:global(:not(.full-width)) {
				grid-column: auto;
			}
		}
	}
</style>
