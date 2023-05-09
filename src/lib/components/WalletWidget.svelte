<script lang="ts">
	import { getExplorerUrl } from '$lib/wallet/utils';
	import type { Address, Chain } from '@wagmi/core';
	import CryptoAddressWidget from './CryptoAddressWidget.svelte';
	import Icon from './Icon.svelte';

	export let address: Address;
	export let chain: string | Chain;
	export let size = 'lg';
	export let networkError = true;
</script>

<a href="#" class="wallet-widget {size}">
	<CryptoAddressWidget disableCopyToClipboard {size} {address} href={getExplorerUrl(chain, address)}>
		<img src="https://ph-files.imgix.net/3e6585ab-2e74-4223-a291-254a7df3cd6c.gif?auto=format" alt="" />
		<svelte:fragment slot="error">
			{#if networkError}
				<Icon name="error" --icon-size="1.25rem" --icon-color="hsla(var(--hsl-warning))" />
			{/if}
		</svelte:fragment>
	</CryptoAddressWidget>
</a>

<style>
	.wallet-widget :global .crypto-address-widget {
		align-items: center;
		justify-content: flex-start;
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
