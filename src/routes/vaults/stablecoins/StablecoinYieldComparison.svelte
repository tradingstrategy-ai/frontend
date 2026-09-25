<!--
@component
"Best stablecoin yields" comparison: for each of the largest stablecoins, the vault with the
highest APY among those with enough TVL and history, with its protocol, lock-up and risk, and
the median APY it is compared against. Server-rendered for the "best stablecoin yield" and
"stablecoin yield comparison" searches.

@example

```svelte
	<StablecoinYieldComparison rows={data.yieldComparison} updatedAt={data.generatedAt} />
```
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters';
	import { formatDataDate } from '$lib/top-vaults/hub-seo';
	import { LEADER_MIN_TVL_USD } from '$lib/top-vaults/listing/insights';
	import type { StablecoinYieldRow } from '$lib/top-vaults/listing/stablecoin-yields';

	interface Props {
		rows: StablecoinYieldRow[];
		updatedAt?: Date | string | null;
	}

	let { rows, updatedAt }: Props = $props();

	let dataDate = $derived(formatDataDate(updatedAt));
	const minTvlLabel = `$${LEADER_MIN_TVL_USD / 1000}k`;
</script>

<!-- a table in which no stablecoin has a qualifying vault answers nothing: leave it out -->
{#if rows.some((row) => row.best)}
	<section class="stablecoin-yield-comparison">
		<h2>Best stablecoin yields right now</h2>
		<p class="intro">
			The highest-APY vault for each of the largest stablecoins, among yield vaults (not trading strategies or liquidity
			pools) rated Low risk or safer with at least
			{minTvlLabel} TVL, three months of history and an APY no higher than 100 %. APY is the annualised return of the last
			30 days, after fees where available.
			{#if dataDate}Data updated {dataDate}.{/if}
			<a href={resolve('/vaults/methodology')}>How we rank vaults</a>
		</p>

		<div class="table-wrapper">
			<table>
				<thead>
					<tr>
						<th scope="col">Stablecoin</th>
						<th scope="col">Highest-APY vault</th>
						<th scope="col" class="number">APY</th>
						<th scope="col" class="number">TVL</th>
						<th scope="col">Protocol</th>
						<th scope="col">Fees</th>
						<th scope="col">Lock-up</th>
						<th scope="col">Risk</th>
						<th scope="col" class="number">Median APY</th>
					</tr>
				</thead>
				<tbody>
					{#each rows as row (row.slug)}
						<tr>
							<th scope="row">
								<a href={resolve('/vaults/stablecoins/[denomination=slug]', { denomination: row.slug })}
									>{row.symbol} vaults</a
								>
							</th>
							{#if row.best}
								<td><a href={resolve('/vaults/[vault=slug]', { vault: row.best.slug })}>{row.best.name}</a></td>
								<td class="number">{formatPercent(row.best.apy, 1)}</td>
								<td class="number">{formatDollar(row.best.tvlUsd, 1, 1)}</td>
								<td>{row.best.protocol}</td>
								<td>{row.best.feeLabel ?? 'Unknown'}</td>
								<td>{row.best.lockup}</td>
								<td>{row.best.risk ?? 'Not rated'}</td>
							{:else}
								<td colspan="7" class="none">No vault meets the rules above</td>
							{/if}
							<td class="number" title="Median across {row.compared} vaults">
								{row.medianApy == null ? '—' : formatPercent(row.medianApy, 1)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
{/if}

<style>
	.stablecoin-yield-comparison {
		display: grid;
		gap: var(--space-md);
	}

	h2 {
		font: var(--f-h3-medium);
	}

	.intro {
		max-width: 60rem;
		margin: 0;
		font: var(--f-ui-md-roman);
		color: var(--c-text-light);
	}

	.table-wrapper {
		overflow-x: auto;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font: var(--f-ui-md-roman);
	}

	th,
	td {
		padding: var(--space-sm) var(--space-md);
		border-bottom: 1px solid var(--c-box-3);
		text-align: left;
		white-space: nowrap;
	}

	thead th {
		font: var(--f-ui-sm-medium);
		color: var(--c-text-extra-light);
	}

	.number {
		text-align: right;
	}

	.none {
		color: var(--c-text-extra-light);
	}

	a {
		text-decoration: underline;
	}
</style>
