<script lang="ts">
	import type { FetchBalanceResult } from '@wagmi/core';
	import { formatNumber } from '$lib/helpers/formatters';
	import { Alert, EntitySymbol } from '$lib/components';
	import Spinner from 'svelte-spinner';

	export let data: MaybePromise<FetchBalanceResult>;
</script>

{#await data}
	<slot skeleton={true} value="---" symbol="---">
		<Spinner size="2rem" color="hsl(var(--hsl-text-light))" />
	</slot>
{:then { symbol, formatted }}
	{@const value = formatNumber(formatted, 2, 4)}
	<slot skeleton={false} {value} {symbol}>
		<EntitySymbol slug={symbol.toLowerCase()} type="token">{value} {symbol}</EntitySymbol>
	</slot>
{:catch error}
	<Alert size="xs">Error loading data</Alert>
{/await}
