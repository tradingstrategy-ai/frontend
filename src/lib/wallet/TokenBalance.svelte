<script lang="ts">
	import type { GetTokenBalanceReturnType } from '$lib/eth-defi/helpers';
	import { formatBalance } from '$lib/eth-defi/helpers';
	import { Alert, EntitySymbol, Tooltip } from '$lib/components';
	import Spinner from 'svelte-spinner';

	export let data: MaybePromise<GetTokenBalanceReturnType>;
</script>

{#await data}
	<slot skeleton={true} value="---" symbol="---">
		<Spinner size="2rem" color="var(--c-text-light)" />
	</slot>
{:then balance}
	{@const { symbol, label } = balance}
	{@const value = formatBalance(balance, 2, 4)}
	<slot skeleton={false} {value} {symbol} {label}>
		<EntitySymbol slug={symbol.toLowerCase()} type="token" size="1.5rem">{value} {label}</EntitySymbol>
	</slot>
{:catch error}
	<Tooltip>
		<Alert slot="trigger" size="xs">Error</Alert>
		<pre slot="popup">{error}</pre>
	</Tooltip>
{/await}
