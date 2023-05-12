<script lang="ts">
	import { getExplorerUrl } from '$lib/wallet/utils';
	import type { Address, Chain } from '@wagmi/core';
	import CryptoAddressWidget from './CryptoAddressWidget.svelte';
	import Icon from './Icon.svelte';

	export let address: Address;
	export let chain: Chain;
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let networkError = true;
</script>

<a href="#" class="wallet-widget {size}">
	<slot name="label" />
	<CryptoAddressWidget disableCopyToClipboard {size} {address} href={getExplorerUrl(chain, address)}>
		<Icon name="wallet" --icon-size="1.25rem" />
	</CryptoAddressWidget>
</a>

<style>
	.wallet-widget :global .crypto-address-widget {
		align-items: center;
		justify-content: flex-start;
	}
</style>
