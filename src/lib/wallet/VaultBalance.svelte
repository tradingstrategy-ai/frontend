<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { BaseVault } from 'trade-executor/vaults/base';
	import type { SmartContracts } from 'trade-executor/schemas/summary';
	import type { TokenBalance as TokenBalanceType } from '$lib/eth-defi/schemas/token';
	import { config } from '$lib/wallet/client';
	import { DataBox } from '$lib/components';
	import TokenBalance from '$lib/wallet/TokenBalance.svelte';

	type TokenType = 'vaultShares' | 'vaultNetValue';

	type Props = {
		address: Address;
		vault: BaseVault<SmartContracts>;
		children?: Snippet<[string, Promise<TokenBalanceType>]>;
		onDataFetch?: (type: TokenType, tokenBalance: TokenBalanceType) => void;
	};

	let { address, vault, children, onDataFetch }: Props = $props();

	let shares = $state() as Promise<TokenBalanceType>;
	let value = $state() as Promise<TokenBalanceType>;

	// fetch shares and value before component render
	$effect.pre(() => {
		shares = vault.getShareBalance(config, address);
		value = vault.getShareValueUSD(config, address);
	});

	// call callback if supplied
	$effect(() => {
		shares.then((val) => onDataFetch?.('vaultShares', val));
		value.then((val) => onDataFetch?.('vaultNetValue', val));
	});
</script>

{#if children}
	{@render children('value', value)}
	{@render children('shares', shares)}
{:else}
	<div class="vault-balance">
		<DataBox label="Number of shares">
			<TokenBalance data={shares} />
		</DataBox>
		<DataBox label="Value of shares">
			<TokenBalance data={value} />
		</DataBox>
	</div>
{/if}

<style>
	.vault-balance {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(15rem, auto));
		gap: var(--space-md) var(--space-lg);

		@media (--viewport-sm-down) {
			gap: var(--space-md);
		}
	}
</style>
