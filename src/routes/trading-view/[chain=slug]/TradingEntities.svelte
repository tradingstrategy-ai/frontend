<script lang="ts">
	import Grid from '$lib/components/Grid.svelte';
	import TopEntities, { type EntityData } from './TopEntities.svelte';
	import TopExchanges from './TopExchanges.svelte';
	import TopPairs from './TopPairs.svelte';
	import TopTokens from './TopTokens.svelte';
	import TopReserves from './TopReserves.svelte';

	interface Props {
		chain: Chain;
		entities: {
			exchanges: Promise<EntityData>;
			pairs: Promise<EntityData>;
			tokens: Promise<EntityData>;
			reserves: Promise<EntityData>;
		};
	}

	let { chain, entities }: Props = $props();
</script>

<div class="trading-entities">
	<h2>{chain.name} trading entities</h2>
	<Grid cols={2} gap="lg">
		<TopEntities
			type="exchanges"
			title="Highest volume exchanges"
			{chain}
			data={entities.exchanges}
			tableComponent={TopExchanges}
			rightColHeader="Vol 30d"
		/>

		<TopEntities
			type="trading-pairs"
			label="pairs"
			title="Highest TVL trading pairs"
			{chain}
			data={entities.pairs}
			tableComponent={TopPairs}
			rightColHeader="TVL"
		/>

		<TopEntities
			type="tokens"
			title="Highest liquidity tokens"
			{chain}
			data={entities.tokens}
			tableComponent={TopTokens}
			rightColHeader="Liquidity"
		/>

		<TopEntities
			type="lending"
			label="reserves"
			title="Highest TVL lending reserves"
			{chain}
			data={entities.reserves}
			tableComponent={TopReserves}
			rightColHeader="TVL"
		/>
	</Grid>
</div>

<style>
	.trading-entities {
		display: contents;

		h2 {
			margin-block: var(--space-lg);
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
		}
	}
</style>
