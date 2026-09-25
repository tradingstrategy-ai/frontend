<!--
@component
One server-rendered paragraph above a hub's vault table answering "which <subject> are best
right now": the APY leaders (linked), the median APY, the curator or protocol holding most of
the TVL, and when the data was last updated. Sentences without data are left out.

@example

```svelte
	<VaultHubInsights insights={data.listingInsights} subject="Morpho vaults" groupBy="curator" updatedAt={generatedAt} />
```
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters';
	import { formatDataDate } from './hub-seo';
	import { LEADER_MIN_TVL_USD, type ListingInsights, type ListingInsightsGroupBy } from './listing/insights';

	interface Props {
		insights: ListingInsights;
		/** What the hub lists, in search wording: "Morpho vaults", "USDC vaults" */
		subject: string;
		groupBy: ListingInsightsGroupBy;
		updatedAt?: Date | string | null;
	}

	let { insights, subject, groupBy, updatedAt }: Props = $props();

	let minTvlLabel = $derived(`$${LEADER_MIN_TVL_USD / 1000}k`);
	let dataDate = $derived(formatDataDate(updatedAt));
</script>

{#if insights.leaders.length || dataDate}
	<p class="hub-insights">
		{#if insights.leaders.length}
			Highest APY among {subject} rated Low risk or safer — leaving out trading strategies and liquidity pools — with at least
			{minTvlLabel} TVL and three months of history:
			{#each insights.leaders as leader, index (leader.slug)}
				{#if index > 0}{index === insights.leaders.length - 1 ? ' and ' : ', '}{/if}<a
					href={resolve('/vaults/[vault=slug]', { vault: leader.slug })}>{leader.name}</a
				>
				({formatPercent(leader.apy, 1)}){/each}.
			{#if insights.medianApy != null && insights.eligibleCount > 3}
				The median APY across those {insights.eligibleCount} vaults is {formatPercent(insights.medianApy, 1)}.
			{/if}
		{/if}
		{#if insights.topGroup}
			{#if groupBy === 'curator'}
				{insights.topGroup.name} curates {formatPercent(insights.topGroup.share, 0)} of the listed TVL.
			{:else}
				{insights.topGroup.name} vaults hold {formatPercent(insights.topGroup.share, 0)} of the listed TVL.
			{/if}
		{/if}
		{#if dataDate}Data updated {dataDate}.{/if}
	</p>

	{#if insights.leaders.length > 1}
		<div class="leaders-table">
			<table>
				<caption>Why the top {subject} differ</caption>
				<thead>
					<tr>
						<th scope="col">Vault</th>
						<th scope="col" class="number">APY</th>
						<th scope="col" class="number">TVL</th>
						<th scope="col">{groupBy === 'curator' ? 'Curator' : 'Protocol'}</th>
						<th scope="col">Fees</th>
						<th scope="col">Lock-up</th>
						<th scope="col">Risk</th>
					</tr>
				</thead>
				<tbody>
					{#each insights.leaders as leader (leader.slug)}
						<tr>
							<th scope="row"><a href={resolve('/vaults/[vault=slug]', { vault: leader.slug })}>{leader.name}</a></th>
							<td class="number">{formatPercent(leader.apy, 1)}</td>
							<td class="number">{formatDollar(leader.tvlUsd, 1, 1)}</td>
							<td>{(groupBy === 'curator' ? leader.curator : leader.protocol) ?? '—'}</td>
							<td>{leader.feeLabel ?? '—'}</td>
							<td>{leader.lockup}</td>
							<td>{leader.risk ?? 'Not rated'}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
{/if}

<style>
	.leaders-table {
		overflow-x: auto;

		table {
			border-collapse: collapse;
			font: var(--f-ui-sm-roman);
		}

		caption {
			padding-bottom: var(--space-sm);
			font: var(--f-ui-md-medium);
			text-align: left;
		}

		th,
		td {
			padding: var(--space-xs) var(--space-md);
			border-bottom: 1px solid var(--c-box-3);
			text-align: left;
			white-space: nowrap;
		}

		thead th {
			color: var(--c-text-extra-light);
		}

		.number {
			text-align: right;
		}

		a {
			text-decoration: underline;
		}
	}

	.hub-insights {
		max-width: 60rem;
		margin: 0;
		font: var(--f-ui-md-roman);
		color: var(--c-text-light);

		a {
			text-decoration: underline;
		}
	}
</style>
