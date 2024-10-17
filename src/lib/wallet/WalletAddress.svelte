<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { ConnectedWallet } from '$lib/wallet/client';
	import { getChain, getExplorerUrl } from '$lib/helpers/chain';
	import { CryptoAddressWidget } from '$lib/components';
	import IconWallet from '~icons/local/wallet';

	export let wallet: ConnectedWallet;
	export let size: ComponentProps<CryptoAddressWidget>['size'] = 'md';

	$: ({ address } = wallet);
	$: chain = getChain(wallet.chain?.id);
</script>

<CryptoAddressWidget {size} {address} href={getExplorerUrl(chain, address)} clipboardCopier={false}>
	<IconWallet slot="icon" --icon-size="1.2em" />
</CryptoAddressWidget>
