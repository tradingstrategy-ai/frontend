<script lang="ts">
	import type { ConnectedStrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { goto } from '$app/navigation';
	import { wizard } from 'wizard/store';
	import { modal, wallet } from '$lib/wallet';
	import { Button, HashAddress, Icon } from '$lib/components';

	export let strategy: ConnectedStrategyRuntimeState;

	$: contracts = strategy.on_chain_data.smart_contracts;

	function launchConnectWizard() {
		wizard.init('connect-wallet', `/strategies/${strategy.id}`, {
			chainId: strategy.on_chain_data.chain_id,
			strategyName: strategy.name,
			contracts
		});
		goto(`/wizard/connect-wallet/introduction`);
	}
</script>

<div class="wallet-widget">
	{#if $wallet.isConnected}
		<Button size="sm" on:click={() => modal.open({ view: 'Account' })}>
			<span class="address">
				<Icon name="wallet" --icon-size="1.25em" />
				<HashAddress address={$wallet.address} endChars={7} />
			</span>
		</Button>
	{:else}
		<Button size="sm" icon="wallet" label="Connect wallet" on:click={launchConnectWizard}>
			<Icon slot="icon" name="wallet" --icon-size="1.25em" />
		</Button>
	{/if}
</div>

<style lang="postcss">
	.address {
		display: inline-grid;
		grid-auto-flow: column;
		gap: 1ex;
		max-width: 10rem;
		align-items: center;
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--ls-ui-sm);

		:global(.icon svg) {
			margin-top: -3px;
		}
	}
</style>
