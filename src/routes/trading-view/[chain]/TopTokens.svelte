<script lang="ts">
	import { formatDollar } from '$lib/helpers/formatters';

	export let loading = false;
	export let rows: Record<string, any>[] = Array(5).fill({});
</script>

<table class="top-tokens" class:loading>
	<tbody>
		{#each rows as row}
			{@const href = loading ? undefined : `/trading-view/${row.chain_slug}/tokens/${row.address}`}
			<svelte:element this={href ? 'a' : 'span'} style:display="contents" {href}>
				<tr>
					<td class="name">
						{row.name ?? '---'}
					</td>
					<td class="symbol">
						{row.symbol ?? '---'}
					</td>
					<td class="liquidity">
						{formatDollar(row.liquidity_latest)}
					</td>
				</tr>
			</svelte:element>
		{/each}
	</tbody>
</table>

<style lang="postcss">
	.top-tokens {
		table-layout: fixed;

		& .name {
			width: 45%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		& .symbol {
			width: 30%;
		}

		& .liquidity {
			width: 25%;
			text-align: right;
			--cell-padding: 0 var(--space-md) 0 var(--space-xs);
		}
	}
</style>
