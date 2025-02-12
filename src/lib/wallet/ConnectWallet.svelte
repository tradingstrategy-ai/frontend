<script lang="ts">
	import type { Chain } from '$lib/helpers/chain';
	import { connect, wallet } from '$lib/wallet/client';
	import WalletSummary from '$lib/wallet/WalletSummary.svelte';
	import { Button } from '$lib/components';
	import IconWallet from '~icons/local/wallet';

	type Props = {
		chain: Chain;
	};

	const { chain }: Props = $props();
</script>

<div class="connect-wallet">
	{#if $wallet.status === 'connected'}
		<div class="is-connected">
			<WalletSummary wallet={$wallet} {chain} />
			<Button size="sm" label="Change wallet" on:click={() => connect(chain.id)} />
		</div>
	{:else}
		<div class="not-connected">
			<div class="desktop">Connect your preferred browser-based, mobile or desktop wallet.</div>
			<div class="mobile">Connect your preferred mobile wallet.</div>
			<Button label="Connect wallet" on:click={() => connect(chain.id)}>
				<IconWallet slot="icon" />
			</Button>
		</div>
	{/if}
</div>

<style>
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
