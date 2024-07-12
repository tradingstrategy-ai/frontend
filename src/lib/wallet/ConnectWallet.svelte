<script lang="ts">
	import type { ConfiguredChainId } from '$lib/wallet';
	import { getChain } from '$lib/helpers/chain';
	import { modal, wallet, WalletSummary } from '$lib/wallet';
	import { Button } from '$lib/components';
	import IconWallet from '~icons/local/wallet';

	export let chainId: ConfiguredChainId | undefined;

	const chain = getChain(chainId)!;

	function connectWallet() {
		modal.open({ view: 'Connect' });
	}
</script>

<div class="connect-wallet">
	{#if $wallet.isConnected}
		<div class="is-connected">
			<WalletSummary wallet={$wallet} {chain} />
			<Button size="sm" label="Change wallet" on:click={connectWallet} />
		</div>
	{:else}
		<div class="not-connected">
			<div class="desktop">Connect your preferred browser-based, mobile or desktop wallet.</div>
			<div class="mobile">Connect your preferred mobile wallet.</div>
			<Button label="Connect wallet" on:click={connectWallet}>
				<IconWallet slot="icon" />
			</Button>
		</div>
	{/if}
</div>

<style lang="postcss">
	.desktop {
		@media (--viewport-xs) {
			display: none;
		}
	}

	.mobile {
		@media (--viewport-sm-up) {
			display: none;
		}
	}

	.connect-wallet {
		display: grid;
		gap: 2rem;
	}

	.is-connected {
		display: grid;
		place-items: start;
		gap: 1.25rem;

		@media (--viewport-sm-down) {
			gap: 2rem;
		}
	}

	.not-connected {
		display: grid;
		gap: 2.5rem;
		margin-bottom: 2.5rem;
	}
</style>
