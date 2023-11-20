<script lang="ts">
	import type { FetchBalanceResult } from '@wagmi/core';
	import { formatNumber } from '$lib/helpers/formatters';
	import { Alert, EntitySymbol } from '$lib/components';
	import Spinner from 'svelte-spinner';

	export let data: MaybePromise<FetchBalanceResult>;
</script>

{#await data}
	<Spinner size="2rem" color="hsl(var(--hsl-text-light))" />
{:then { symbol, formatted }}
	<EntitySymbol slug={symbol.toLowerCase()} type="token">{formatNumber(formatted, 2, 4)} {symbol}</EntitySymbol>
{:catch error}
	<Alert size="xs">Error loading data</Alert>
{/await}
