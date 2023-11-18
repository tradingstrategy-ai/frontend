<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { formatNumber } from '$lib/helpers/formatters';
	import { fetchBalance, readContract } from '@wagmi/core';
	import comptrollerABI from '$lib/eth-defi/abi/enzyme/ComptrollerLib.json';
	import { wallet, WalletAddress, WalletInfo, WalletInfoItem } from '$lib/wallet';
	import { EntitySymbol } from '$lib/components';
	import Spinner from 'svelte-spinner';

	export let contracts: Contracts;

	$: ({ address, chain } = $wallet);
	$: chainCurrency = chain?.nativeCurrency.symbol;

	const dispatch = createEventDispatcher();

	async function fetchNativeCurrency(address: Address) {
		const nativeCurrency = await fetchBalance({ address });
		dispatch('dataFetch', { nativeCurrency });
		return nativeCurrency;
	}

	async function fetchDenominationToken(address: Address) {
		const token = (await readContract({
			address: contracts.comptroller,
			abi: comptrollerABI,
			functionName: 'getDenominationAsset'
		})) as Address;

		const balance = await fetchBalance({ address, token });

		dispatch('dataFetch', {
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
		{#await fetchNativeCurrency(address)}
			<Spinner size="30" color="hsl(var(--hsl-text-light))" />
		{:then balance}
			{formatNumber(balance.formatted, 2, 4)}
		{/await}
	</WalletInfoItem>

	<WalletInfoItem>
		<EntitySymbol slot="label" type="token" label="USDC" slug="usdc" />
		{#await fetchDenominationToken(address)}
			<Spinner size="30" color="hsl(var(--hsl-text-light))" />
		{:then balance}
			{formatNumber(balance.formatted, 2, 4)}
		{:catch}
			---
		{/await}
	</WalletInfoItem>
</WalletInfo>
