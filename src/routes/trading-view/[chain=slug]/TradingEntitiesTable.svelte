<script lang="ts">
	import { formatValue } from '$lib/helpers/formatters';

	type TradingEntityRow = Record<string, any>;

	export let loading = false;
	export let rows: TradingEntityRow[];
	export let getHref: Formatter<TradingEntityRow>;
</script>

<table class="trading-entities-table datatable" class:loading>
	<tbody>
		{#each rows as row}
			{@const href = loading ? undefined : getHref(row)}
			<svelte:element this={href ? 'a' : 'span'} style:display="contents" {href}>
				<tr>
					<slot {row} format={formatValue} />
				</tr>
			</svelte:element>
		{/each}
	</tbody>
</table>

<style>
	.trading-entities-table {
		table-layout: fixed;

		:global(td) {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

			&:last-child {
				width: 10ch;
				text-align: right;
				--cell-padding: 0 var(--space-md) 0 var(--space-xs);
			}
		}
	}
</style>
