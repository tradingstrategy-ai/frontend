<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { ConnectedWallet } from '$lib/wallet';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import { CryptoAddressWidget } from '$lib/components';

	export let wallet: ConnectedWallet;
	export let size: ComponentProps<CryptoAddressWidget>['size'] = 'md';

	$: ({ address, chain } = wallet);
</script>

<CryptoAddressWidget {size} icon="wallet" clipboardCopier={false} {address} href={getExplorerUrl(chain, address)} />
