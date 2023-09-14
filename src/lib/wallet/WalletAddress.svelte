<script lang="ts">
	import type { ConnectedWallet } from '$lib/wallet';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import { CryptoAddressWidget } from '$lib/components';

	export let wallet: ConnectedWallet;
	export let size: 'sm' | 'md' | 'lg' = 'md';

	$: ({ address, chain } = wallet);
</script>

<CryptoAddressWidget {size} icon="wallet" clipboardCopier={false} {address} href={getExplorerUrl(chain, address)} />
