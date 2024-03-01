<script lang="ts">
	import type { ConnectedStrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import { goto } from '$app/navigation';
	import { wizard } from 'wizard/store';
	import { disconnect, wallet } from '$lib/wallet';
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
		<Button size="sm" on:click={disconnect}>
			<span class="address">
				<Icon name="wallet" --icon-size="1.25em" />
				<HashAddress address={$wallet.address} endChars={7} />
			</span>
		</Button>
		<span class="hover-info">
			<Icon name="unlink" --icon-size="1.25em" />
			Disconnect wallet
		</span>
	{:else}
		<Button size="sm" icon="wallet" label="Connect wallet" on:click={launchConnectWizard}>
			<Icon slot="icon" name="wallet" --icon-size="1.25em" />
		</Button>
	{/if}
</div>

<style lang="postcss">
	.wallet-widget {
		position: relative;
	}

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

	.hover-info {
		position: absolute;
		left: 0;
		right: 0;
		bottom: -2em;
		display: flex;
		gap: 1ex;
		justify-content: center;
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--ls-ui-sm);
		color: var(--c-text-extra-light);
		opacity: 0;
		transition: opacity var(--time-xs) ease-out;

		.wallet-widget:hover &:not(:hover) {
			opacity: 1;
		}
	}
</style>
