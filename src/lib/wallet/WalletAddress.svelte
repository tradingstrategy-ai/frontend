<!--
@component
Connected wallet address with the wallet icon, linking to the block explorer.

@example

```svelte
	<WalletAddress {wallet} size="sm" />
```
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { ConnectedWallet } from '$lib/wallet/client';
	import { getChain, getExplorerUrl } from '$lib/helpers/chain';
	import { CryptoAddressWidget } from '$lib/components';
	import IconWallet from '~icons/local/wallet';

	interface Props {
		wallet: ConnectedWallet;
		size?: ComponentProps<typeof CryptoAddressWidget>['size'];
	}

	let { wallet, size = 'md' }: Props = $props();

	let address = $derived(wallet.address);
	let chain = $derived(getChain(wallet.chain?.id));
</script>

<CryptoAddressWidget {size} {address} href={getExplorerUrl(chain, address)} clipboardCopier={false}>
	{#snippet icon()}
		<IconWallet --icon-size="1.2em" />
	{/snippet}
</CryptoAddressWidget>
