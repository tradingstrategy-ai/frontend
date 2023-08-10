<script lang="ts">
	import type { Chain } from '$lib/helpers/chain';
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { wizard } from 'wizard/store';
	import { wallet, VaultBalance, WalletAddress, WrongNetwork } from '$lib/wallet';
	import { Alert, Button, SummaryBox } from '$lib/components';
	import { goto } from '$app/navigation';

	export let strategy: StrategyRuntimeState;
	export let chain: Chain;

	$: contracts = strategy.on_chain_data.smart_contracts;
	$: depositEnabled = !!(
		contracts.vault &&
		contracts.comptroller &&
		contracts.payment_forwarder &&
		contracts.fund_value_calculator
	);

	function launchWizard(slug: string) {
		wizard.init(slug, `/strategies/${strategy.id}`, {
			chainId: chain.chain_id,
			strategyName: strategy.name,
			contracts
		});
		goto(`/wizard/${slug}/introduction`);
	}
</script>

{#if depositEnabled}
	<SummaryBox title="Invest" ctaPosition="top">
		<svelte:fragment slot="cta">
			{#if $wallet.status === 'connected'}
				<WalletAddress wallet={$wallet} />
			{/if}
		</svelte:fragment>
		<div class="content">
			{#if $wallet.status !== 'connected'}
				<div class="not-connected">
					<strong>Wallet not connected.</strong> Please connect wallet to see your deposit status.
				</div>
			{:else if $wallet.chain.id !== chain.chain_id}
				<WrongNetwork chainId={chain.chain_id} chainName={chain.chain_name} />
			{:else}
				<VaultBalance {contracts} address={$wallet.address} />
			{/if}
		</div>
		<div class="actions">
			<Button on:click={() => launchWizard('connect-wallet')}>
				{$wallet.status === 'connected' ? 'Change wallet' : 'Connect wallet'}
			</Button>
			<Button label="Deposit" on:click={() => launchWizard('deposit')} />
			<Button label="Redeem" on:click={() => launchWizard('redeem')} />
		</div>
	</SummaryBox>
{:else}
	<Alert status="info" size="md" title="Deposits not available">
		This strategy is not using smart contract-based capital management and is not accepting external investments.
	</Alert>
{/if}

<style lang="postcss">
	.not-connected {
		padding: var(--space-sm) 0;
		font: var(--f-ui-md-roman);
		letter-spacing: var(--f-ui-md-spacing, normal);

		@media (--viewport-lg-up) {
			font: var(--f-ui-lg-roman);
			letter-spacing: var(--f-ui-lg-spacing, normal);
		}
	}

	.actions {
		display: grid;
		gap: var(--space-ml);
		grid-template-columns: repeat(3, 1fr);
		@media (--viewport-sm-down) {
			grid-template-columns: 1fr;
		}
	}
</style>
