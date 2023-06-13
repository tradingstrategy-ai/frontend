<script lang="ts">
	import { fetchBalance, fetchToken, prepareWriteContract } from '@wagmi/core';
	import { formatUnits } from 'viem';
	import fundValueCalculatorABI from '$lib/eth-defi/abi/enzyme/FundValueCalculator.json';
	import { DataBox, Grid } from '$lib/components';
	import { TokenBalance } from '$lib/wallet';

	export let address: Address;
	export let contracts: Contracts;

	async function getAccountNetValue({ vault, fund_value_calculator }: Contracts, account: Address) {
		const { result } = await prepareWriteContract({
			address: fund_value_calculator,
			abi: fundValueCalculatorABI,
			functionName: 'calcNetValueForSharesHolder',
			args: [vault, account]
		});

		const [address, value] = result as [Address, bigint];
		const { decimals, symbol } = await fetchToken({ address });

		return { decimals, symbol, value, formatted: formatUnits(value, decimals) };
	}
</script>

<Grid cols={2} gap="lg">
	<DataBox label="Number of shares">
		<TokenBalance data={fetchBalance({ token: contracts.vault, address })} />
	</DataBox>
	<DataBox label="Value of shares">
		<TokenBalance data={getAccountNetValue(contracts, address)} />
	</DataBox>
</Grid>

<style lang="postcss">
</style>
