<script module lang="ts">
	export interface EntityTableProps {
		loading?: boolean;
		rows: TradingEntityRow[];
	}
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import TargetableLink from '$lib/components/TargetableLink.svelte';
	import { formatValue } from '$lib/helpers/formatters';

	type TradingEntityRow = Record<string, any>;

	interface Props extends EntityTableProps {
		getHref: Formatter<TradingEntityRow>;
		cells: Snippet<[TradingEntityRow, Formatter<string>]>;
	}

	let { loading = false, rows, getHref, cells }: Props = $props();

	let offsetWidth = $state<number>();
</script>

<!-- --table-width needed for proper tr.targetable styling  -->
<table class="trading-entities-table datatable" class:loading bind:offsetWidth style:--table-width="{offsetWidth}px">
	<tbody>
		{#each rows as row, idx (idx)}
			<tr class="targetable">
				{@render cells(row, formatValue)}
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
