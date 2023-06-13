<script lang="ts">
	import type { FetchBalanceResult } from '@wagmi/core';
	import { AlertList, AlertItem, EntitySymbol } from '$lib/components';
	import Spinner from 'svelte-spinner';

	export let data: MaybePromise<FetchBalanceResult>;
	export let maxDigits = 2;

	function format({ formatted }: FetchBalanceResult) {
		return Number(formatted).toLocaleString('en', {
			maximumFractionDigits: maxDigits
		});
	}
</script>

{#await data}
	<Spinner size="2rem" color="hsla(var(--hsl-text-light))" />
{:then token}
	<EntitySymbol slug={token.symbol.toLowerCase()} type="token">{format(token)} {token.symbol}</EntitySymbol>
{:catch error}
	<AlertList size="xs">
		<AlertItem>Error loading data</AlertItem>
	</AlertList>
{/await}
