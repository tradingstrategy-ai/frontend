<script lang="ts">
	import TargetableLink from '$lib/components/TargetableLink.svelte';
	import { formatValue } from '$lib/helpers/formatters';

	type TradingEntityRow = Record<string, any>;

	export let loading = false;
	export let rows: TradingEntityRow[];
	export let getHref: Formatter<TradingEntityRow>;
</script>

<table class="trading-entities-table datatable" class:loading>
	<tbody>
		{#each rows as row}
			<tr class="targetable">
				<slot {row} format={formatValue} />
				<td class="target">
					{#if !loading}
						<TargetableLink href={getHref(row)} label="View details" />
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	.trading-entities-table {
		table-layout: fixed;

		.target {
			width: 0;
			padding: 0;
		}

		:global(td) {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;

			&:nth-last-child(2) {
				width: 10ch;
				text-align: right;
				padding-left: 0.375rem;
				border-radius: 0 var(--table-border-radius) var(--table-border-radius) 0;
			}
		}
	}
</style>
