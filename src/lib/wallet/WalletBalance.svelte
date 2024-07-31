<script lang="ts">
	import type { GetBalanceReturnType } from '@wagmi/core';
	import type { GetTokenBalanceReturnType } from '$lib/eth-defi/helpers';
	import { wallet, WalletAddress, WalletInfo, WalletInfoItem } from '$lib/wallet';
	import { EntitySymbol } from '$lib/components';
	import { formatBalance } from '$lib/eth-defi/helpers';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let nativeCurrency: GetBalanceReturnType;
	export let denominationToken: Maybe<GetTokenBalanceReturnType>;

	const chainSymbol = nativeCurrency.symbol;
</script>

<WalletInfo alignValues="right">
	<WalletInfoItem label="Account">
		<WalletAddress size="sm" wallet={$wallet} />
	</WalletInfoItem>

	<WalletInfoItem>
		<EntitySymbol slot="label" size="1.5rem" label={chainSymbol} logoUrl={getLogoUrl('token', chainSymbol)} />
		{formatBalance(nativeCurrency, 2, 4)}
	</WalletInfoItem>

	{#if denominationToken}
		{@const { label, symbol } = denominationToken}
		<WalletInfoItem>
			<EntitySymbol slot="label" size="1.5rem" {label} logoUrl={getLogoUrl('token', symbol)}>
				{label}
				{#if label === 'USDC.e'}
					(bridged)
				{/if}
			</EntitySymbol>
			{formatBalance(denominationToken, 2, 4)}
		</WalletInfoItem>
	{/if}
</WalletInfo>
