<script lang="ts">
	import type { EnzymeSmartContracts } from 'trade-executor/strategy/summary';
	import { createEventDispatcher } from 'svelte';
	import { formatUnits } from 'viem';
	import { simulateContract } from '@wagmi/core';
	import { config, getTokenBalance } from '$lib/wallet';
	import fundValueCalculatorABI from '$lib/eth-defi/abi/enzyme/FundValueCalculator.json';
	import { DataBox } from '$lib/components';
	import { TokenBalance } from '$lib/wallet';

	export let address: Address;
	export let contracts: EnzymeSmartContracts;

	const dispatch = createEventDispatcher();

	const shares = fetchVaultShares(address);
	const value = fetchVaultNetValue(address);

	async function fetchVaultShares(address: Address) {
		const vaultShares = await getTokenBalance(config, { token: contracts.vault!, address });
		dispatch('dataFetch', { vaultShares });
		return vaultShares;
	}

	async function fetchVaultNetValue(address: Address) {
		const { result } = await simulateContract(config, {
			abi: fundValueCalculatorABI,
			address: contracts.fund_value_calculator,
			functionName: 'calcNetValueForSharesHolder',
			args: [contracts.vault, address]
		});

		const [token, value] = result as [Address, bigint];
		const denominationToken = await getTokenBalance(config, { token, address });
		const { decimals, symbol } = denominationToken;

		const vaultNetValue = {
			decimals,
			symbol: symbol ?? '---',
			value,
			formatted: formatUnits(value, decimals)
		};

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
