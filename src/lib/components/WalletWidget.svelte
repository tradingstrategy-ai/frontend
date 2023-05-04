<script lang="ts">
	import { getExplorerUrl } from '$lib/wallet/utils';
	import type { Address, Chain } from '@wagmi/core';
	import CryptoAddressWidget from './CryptoAddressWidget.svelte';

	export let address: Address;
	export let chain: Chain;
</script>

<a href="#" class="wallet-widget">
	<CryptoAddressWidget size="sm" {address} href={getExplorerUrl(chain, address)}>
		<img src="https://ph-files.imgix.net/3e6585ab-2e74-4223-a291-254a7df3cd6c.gif?auto=format" alt="" />
	</CryptoAddressWidget>
</a>

<style>
	.wallet-widget :global .crypto-address-widget {
		align-items: center;
	}
	img {
		border: none;
		border-radius: var(--radius-lg);
		background: hsla(var(--hsl-box), var(--a-box-c));
		margin-right: var(--space-xxxs);
		height: 1.75rem;
		width: 1.75rem;
	}
</style>
