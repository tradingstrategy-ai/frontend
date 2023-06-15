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
		dispatch('dataFetch', { vaultShares });
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
		const denominationToken = await fetchToken({ address });
		const { decimals, symbol } = denominationToken;

		const vaultNetValue = { decimals, symbol, value, formatted: formatUnits(value, decimals) };
		dispatch('dataFetch', { denominationToken, vaultNetValue });
		return vaultNetValue;
	}
</script>

<div class="vault-balance">
	<DataBox label="Number of shares">
		<TokenBalance data={fetchVaultShares(address)} />
	</DataBox>
	<DataBox label="Value of shares">
		<TokenBalance data={fetchVaultNetValue(address)} />
	</DataBox>
</div>

<style lang="postcss">
	.vault-balance {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, auto));
		gap: var(--space-md) var(--space-lg);

		@media (--viewport-sm-down) {
			gap: var(--space-md);
		}
	}
</style>
