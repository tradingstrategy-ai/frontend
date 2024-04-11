<script lang="ts">
	import type { ConfiguredChainId } from '$lib/wallet';
	import { getChain } from '$lib/helpers/chain';
	import { disconnect, modal, wallet, WalletSummary } from '$lib/wallet';
	import { Button } from '$lib/components';

	export let chainId: ConfiguredChainId | undefined;

	const chain = getChain(chainId)!;
</script>

<div class="connect-wallet">
	{#if $wallet.isConnected}
		<div class="connected-wallet">
			<WalletSummary wallet={$wallet} {chain} />
			<Button size="sm" label="Change wallet" on:click={disconnect} />
		</div>
	{:else}
		<div class="wallet-options">
			Connect your preferred browser-based, mobile or desktop wallet.
			<Button icon="wallet" label="Connect wallet" on:click={() => modal.open()} />
		</div>
	{/if}
</div>

<style lang="postcss">
	.connect-wallet {
		display: grid;
		gap: var(--space-xl);
	}

	.connected-wallet {
		display: grid;
		place-items: start;
		gap: var(--space-ls);

		@media (--viewport-sm-down) {
			gap: var(--space-xl);
		}
	}

	.wallet-options {
		display: grid;
		gap: 2.5rem;
		margin-bottom: 2.5rem;
	}
</style>
