<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fetchBalance, fetchToken, prepareWriteContract } from '@wagmi/core';
	import { formatUnits } from 'viem';
	import fundValueCalculatorABI from '$lib/eth-defi/abi/enzyme/FundValueCalculator.json';
	import { DataBox, Grid } from '$lib/components';
	import { TokenBalance } from '$lib/wallet';

	export let address: Address;
	export let contracts: Contracts;

	const dispatch = createEventDispatcher();

	async function fetchVaultShares(address: Address) {
		const vaultShares = await fetchBalance({ token: contracts.vault, address });
		dispatch('balanceFetch', { vaultShares });
		return vaultShares;
	}

	async function fetchVaultNetValue(account: Address) {
		const { result } = await prepareWriteContract({
			address: contracts.fund_value_calculator,
			abi: fundValueCalculatorABI,
			functionName: 'calcNetValueForSharesHolder',
			args: [contracts.vault, account]
		});

		const [address, value] = result as [Address, bigint];
		const { decimals, symbol } = await fetchToken({ address });

		const vaultNetValue = { decimals, symbol, value, formatted: formatUnits(value, decimals) };
		dispatch('balanceFetch', { vaultNetValue });
		return vaultNetValue;
	}
</script>

<Grid cols={2} gap="lg">
	<DataBox label="Number of shares">
		<TokenBalance data={fetchVaultShares(address)} />
	</DataBox>
	<DataBox label="Value of shares">
		<TokenBalance data={fetchVaultNetValue(address)} />
	</DataBox>
</Grid>

<style lang="postcss">
</style>
