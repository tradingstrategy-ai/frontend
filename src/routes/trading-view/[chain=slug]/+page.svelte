<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import ChainHeader from './ChainHeader.svelte';
	import SummaryDataTile from './SummaryDataTile.svelte';
	import BlockInfoTile from './BlockInfoTile.svelte';
	import { Grid } from '$lib/components';
	import TopEntities from './TopEntities.svelte';
	import TopExchanges from './TopExchanges.svelte';
	import TopPairs from './TopPairs.svelte';
	import TopTokens from './TopTokens.svelte';
	import TopReserves from './TopReserves.svelte';

	import Button from '$lib/components/Button.svelte';
	import { formatDollar } from '$lib/helpers/formatters';

	type VaultRow = {
		id: string;
		name: string;
		protocol?: string;
		tvlUsd: number;
		return1m?: number | null;
	};

	type VaultPreviewData = {
		rows?: VaultRow[];
		error?: unknown;
	};

	export let data: {
		chain: {
			chain_name: string;
			chain_slug: string;
			homepage?: string | null;
			end_block: number;
			last_swap_at: string;
			start_block: number;
			first_swap_at: string;
			exchanges: number;
			pairs: number;
			tracked_pairs: number;
		};
		vaults: VaultPreviewData;
		exchanges: unknown;
		pairs: unknown;
		tokens: unknown;
		reserves: unknown;
	};

	const { chain, vaults } = data;
	const previewVaults = (vaults?.rows ?? []).slice(0, 3);
</script>

<svelte:head>
	<title>{chain.chain_name} decentralised exchanges and trading pairs</title>
	<meta name="description" content={`Top ${chain.chain_name} tokens and prices`} />
</svelte:head>

<Breadcrumbs labels={{ [chain.chain_slug]: chain.chain_name }} />

<main>
	<ChainHeader name={chain.chain_name} slug={chain.chain_slug} homepage={chain.homepage} />

	<section class="ds-container summary-data" data-testid="chain-summary">
		<div class="summary-cards">
			<div class="block-info">
				<BlockInfoTile title="Last indexed block" count={chain.end_block} timestamp={chain.last_swap_at} />
				<BlockInfoTile title="First indexed block" count={chain.start_block} timestamp={chain.first_swap_at} />
			</div>

			<SummaryDataTile
				count={chain.exchanges}
				title="Exchanges"
				description="Decentralised exchanges with market data available on Trading Strategy"
				buttonLabel="See exchanges"
				href="{chain.chain_slug}/exchanges"
			/>

			<SummaryDataTile
				count={chain.pairs}
				title="Tracked trading pairs"
				description="Total trading pairs on Trading Strategy for this blockchain."
				buttonLabel="See trading pairs"
				href="{chain.chain_slug}/trading-pairs"
			/>

			<SummaryDataTile
				count={chain.tracked_pairs}
				title="Active trading pairs"
				description="Trading pairs with market data feeds. Active trading pairs have enough trading activity to have data feeds generated for them."
				buttonLabel="See inclusion criteria"
				href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html"
				rel="external"
			/>

			<article class="tile a top-vault-tile">
				<div class="top-vault-content">
					<h3>Top vaults</h3>
					<p>Top-performing vaults on this chain.</p>
				</div>

				<div class="vault-list">
					{#if vaults?.error}
						<p class="status">Unable to load vault data right now.</p>
					{:else if previewVaults.length}
						<ul>
							{#each previewVaults as vault}
								<li>
									<span class="vault-name">{vault.name}</span>
									<span class="vault-tvl">{formatDollar(vault.tvlUsd, 2, 2)}</span>
								</li>
							{/each}
						</ul>
					{:else}
						<p class="status">No vaults tracked for this chain yet.</p>
					{/if}
				</div>

				<div class="vault-cta">
					<Button size="sm" label="See vaults" href={`/trading-view/${chain.chain_slug}/vaults`} secondary />
				</div>
			</article>
		</div>
	</section>

	<section class="ds-container trading-entities">
		<h2>{chain.chain_name} trading entities</h2>
		<Grid cols={2} gap="lg">
			<TopEntities
				type="exchanges"
				title="Highest volume exchanges"
				{chain}
				data={data.exchanges}
				tableComponent={TopExchanges}
				rightColHeader="Vol 30d"
			/>

			<TopEntities
				type="trading-pairs"
				label="pairs"
				title="Highest TVL trading pairs"
				{chain}
				data={data.pairs}
				tableComponent={TopPairs}
				rightColHeader="TVL"
			/>

			<TopEntities
				type="tokens"
				title="Highest liquidity tokens"
				{chain}
				data={data.tokens}
				tableComponent={TopTokens}
				rightColHeader="Liquidity"
			/>

			<TopEntities
				type="lending"
				label="reserves"
				title="Highest TVL lending reserves"
				{chain}
				data={data.reserves}
				tableComponent={TopReserves}
				rightColHeader="TVL"
			/>
		</Grid>
	</section>
</main>

<style>
	main {
		--layout-gap: var(--space-lg);

		@media (--viewport-md-down) {
			--layout-gap: var(--space-md);
			--grid-gap: var(--layout-gap);
		}

		display: grid;
		gap: var(--layout-gap);
	}

	.summary-data {
		width: 100%;
	}

	.summary-cards {
		display: grid;
		gap: var(--space-lg);
		grid-template-columns: repeat(1, minmax(0, 1fr));
	}

	@media (min-width: 768px) {
		.summary-cards {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	@media (min-width: 1024px) {
		.summary-cards {
			grid-template-columns: repeat(4, minmax(0, 1fr));
		}
	}

	@media (min-width: 1280px) {
		.summary-cards {
			grid-template-columns: repeat(5, minmax(0, 1fr));
		}
	}

	.block-info {
		display: grid;
		gap: var(--space-lg);
		grid-template-rows: repeat(2, minmax(0, 1fr));
		height: 100%;
	}

	@media (--viewport-md-down) {
		.block-info {
			grid-template-rows: none;
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: var(--space-md);
		}
	}

	.top-vault-tile {
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		padding: calc(var(--container-width) * 0.15);
		height: 100%;
	}

	@media (--viewport-md-down) {
		.top-vault-tile {
			padding: var(--space-ls);
		}
	}

	.top-vault-content {
		display: grid;
		gap: var(--space-xs);
	}

	.top-vault-content h3 {
		margin: 0;
		font: var(--f-h4-medium);
	}

	.top-vault-content p {
		font: var(--f-ui-small-roman);
		letter-spacing: 0.01em;
		color: var(--c-text-light);
	}

	.vault-list {
		display: grid;
		gap: var(--space-sm);
	}

	.vault-list ul {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-sm);
	}

	.vault-list li {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
		gap: var(--space-sm);
		font: var(--f-ui-md-roman);
	}

	.vault-name {
		font-weight: 600;
	}

	.vault-tvl {
		color: var(--c-text-light);
		font: var(--f-ui-sm-medium);
	}

	.vault-cta {
		margin-top: auto;
	}

	.trading-entities {
		h2 {
			margin-block: var(--space-lg);
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
		}
	}

	.status {
		color: var(--c-text-extra-light);
	}
</style>
