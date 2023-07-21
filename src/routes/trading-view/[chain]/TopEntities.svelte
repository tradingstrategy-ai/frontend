<script lang="ts">
	import type { ComponentType } from 'svelte';
	import type { Chain } from '$lib/helpers/chain';
	import { AlertList, AlertItem, Button, SummaryBox } from '$lib/components';

	export let type: string;
	export let title: string;
	export let chain: Chain;
	export let data: Promise<Record<string, any>[]>;
	export let tableComponent: ComponentType;

	$: label = type.replaceAll('-', ' ');
</script>

<SummaryBox {title} ctaPosition="bottom">
	{#await data}
		<svelte:component this={tableComponent} loading />
	{:then rows}
		<svelte:component this={tableComponent} {rows} />
	{:catch}
		<AlertList>
			<AlertItem>An error occurred loading {label}. Try reloading the page.</AlertItem>
		</AlertList>
	{/await}

	<Button slot="cta" href="/trading-view/{chain.chain_slug}/{type}">
		View all {chain.chain_name}
		{label}
	</Button>
</SummaryBox>
