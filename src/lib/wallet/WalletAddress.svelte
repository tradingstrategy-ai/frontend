<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { ConnectedWallet } from '$lib/wallet';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import { CryptoAddressWidget } from '$lib/components';
	import IconWallet from '~icons/local/wallet';

	export let wallet: ConnectedWallet;
	export let size: ComponentProps<CryptoAddressWidget>['size'] = 'md';

	$: ({ address, chain } = wallet);
</script>

<CryptoAddressWidget {size} {address} href={getExplorerUrl(chain, address)} clipboardCopier={false}>
	<IconWallet slot="icon" --icon-size="1.2em" />
</CryptoAddressWidget>
