<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { fetchBalance, fetchToken, prepareWriteContract } from '@wagmi/core';
	import { formatUnits } from 'viem';
	import fundValueCalculatorABI from '$lib/eth-defi/abi/enzyme/FundValueCalculator.json';
	import { DataBox } from '$lib/components';
	import { TokenBalance } from '$lib/wallet';

	export let address: Address;
	export let contracts: Contracts;

	const dispatch = createEventDispatcher();

	const shares = fetchVaultShares(address);
	const value = fetchVaultNetValue(address);

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

<slot {shares} {value}>
	<div class="vault-balance">
		<DataBox label="Number of shares">
			<TokenBalance data={shares} />
		</DataBox>
		<DataBox label="Value of shares">
			<TokenBalance data={value} />
		</DataBox>
	</div>
</slot>

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
