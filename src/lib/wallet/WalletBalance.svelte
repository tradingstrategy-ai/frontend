<script lang="ts">
	import type { Wizard } from 'wizard/store';
	import { fetchBalance, readContract } from '@wagmi/core';
	import comptrollerABI from '$lib/eth-defi/abi/enzyme/ComptrollerLib.json';
	import { wallet } from '$lib/wallet/client';
	import { EntitySymbol } from '$lib/components';
	import WalletAddress from './WalletAddress.svelte';
	import WalletInfo from './WalletInfo.svelte';
	import WalletInfoItem from './WalletInfoItem.svelte';

	import Spinner from 'svelte-spinner';

	export let wizard: Wizard;

	$: ({ contracts, nativeCurrency } = $wizard.data);
	$: ({ address, chain } = $wallet);
	$: chainCurrency = nativeCurrency?.symbol ?? chain?.nativeCurrency.symbol;

	async function getNativeCurrency(address: Address) {
		const nativeCurrency = await fetchBalance({ address });
		wizard.updateData({ nativeCurrency });
		return nativeCurrency;
	}

	async function getDenominationToken(address: Address) {
		const token = (await readContract({
			address: contracts.comptroller,
			abi: comptrollerABI,
			functionName: 'getDenominationAsset'
		})) as Address;
		const balance = await fetchBalance({ address, token });
		wizard.updateData({
			denominationToken: { address: token, ...balance }
		});
		return balance;
	}
</script>

<WalletInfo alignValues="right">
	<WalletInfoItem label="Account">
		<WalletAddress size="sm" wallet={$wallet} />
	</WalletInfoItem>

	<WalletInfoItem>
		<EntitySymbol slot="label" type="token" label={chainCurrency} slug={chainCurrency?.toLowerCase()} />
		{#await getNativeCurrency(address)}
			<Spinner size="30" color="hsla(var(--hsl-text-light))" />
		{:then balance}
			{balance.formatted ?? '---'}
		{/await}
	</WalletInfoItem>

	<WalletInfoItem>
		<EntitySymbol slot="label" type="token" label="USDC" slug="usdc" />
		{#await getDenominationToken(address)}
			<Spinner size="30" color="hsla(var(--hsl-text-light))" />
		{:then balance}
			{balance.formatted ?? '---'}
		{:catch}
			---
		{/await}
	</WalletInfoItem>
</WalletInfo>
