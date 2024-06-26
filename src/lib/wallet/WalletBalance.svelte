<script lang="ts">
	import type { EnzymeSmartContracts } from 'trade-executor/strategy/summary';
	import { createEventDispatcher } from 'svelte';
	import { getBalance, readContract } from '@wagmi/core';
	import { formatBalance } from '$lib/eth-defi/helpers';
	import comptrollerABI from '$lib/eth-defi/abi/enzyme/ComptrollerLib.json';
	import { config, wallet, WalletAddress, WalletInfo, WalletInfoItem } from '$lib/wallet';
	import { getTokenBalance } from '$lib/eth-defi/helpers';
	import { EntitySymbol, Spinner } from '$lib/components';

	export let contracts: EnzymeSmartContracts;

	$: ({ address, chain } = $wallet);
	$: chainCurrency = chain?.nativeCurrency.symbol;

	const dispatch = createEventDispatcher();

	async function fetchNativeCurrency(address: Address) {
		const nativeCurrency = await getBalance(config, { address });
		dispatch('dataFetch', { nativeCurrency });
		return nativeCurrency;
	}

	async function fetchDenominationToken(address: Address) {
		const token = await readContract(config, {
			address: contracts.comptroller,
			abi: comptrollerABI,
			functionName: 'getDenominationAsset'
		});
		const denominationToken = await getTokenBalance(config, { address, token });
		dispatch('dataFetch', { denominationToken });
		return denominationToken;
	}
</script>

<WalletInfo alignValues="right">
	<WalletInfoItem label="Account">
		<WalletAddress size="sm" wallet={$wallet} />
	</WalletInfoItem>

	<WalletInfoItem>
		<EntitySymbol slot="label" type="token" label={chainCurrency} slug={chainCurrency?.toLowerCase()} size="1.5rem" />
		{#await fetchNativeCurrency(address)}
			<Spinner />
		{:then balance}
			{formatBalance(balance, 2, 4)}
		{/await}
	</WalletInfoItem>

	{#if contracts.comptroller}
		<WalletInfoItem>
			<!-- TODO: make EntitySymbol dynamic based on denomination token -->
			<EntitySymbol slot="label" type="token" slug="usdc" size="1.5rem">USDC.e (bridged)</EntitySymbol>
			{#await fetchDenominationToken(address)}
				<Spinner />
			{:then balance}
				{formatBalance(balance, 2, 4)}
			{:catch}
				---
			{/await}
		</WalletInfoItem>
	{/if}
</WalletInfo>
