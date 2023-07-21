<script lang="ts">
	import { formatInterestRate } from '$lib/helpers/formatters';

	export let loading = false;
	export let rows: Record<string, any>[] = Array(5).fill({});
</script>

<table class="top-reserves" class:loading>
	<tbody>
		{#each rows as row}
			{@const href = loading
				? undefined
				: `/trading-view/${row.chain_slug}/lending/${row.protocol_slug}/${row.reserve_slug}`}
			<svelte:element this={href ? 'a' : 'span'} style:display="contents" {href}>
				<tr>
					<td class="asset-name">
						{row.asset_name ?? '---'}
					</td>
					<td class="asset-symbol">
						{row.asset_symbol ?? '---'}
					</td>
					<td class="variable-borrow-apr">
						{formatInterestRate(row.additional_details?.variable_borrow_apr_latest)}
					</td>
				</tr>
			</svelte:element>
		{/each}
	</tbody>
</table>

<style lang="postcss">
	.top-reserves {
		table-layout: fixed;

		& .asset-name {
			width: 50%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		& .asset-symbol {
			width: 25%;
		}

		& .variable-borrow-apr {
			width: 25%;
			text-align: right;
			--cell-padding: 0 var(--space-md) 0 var(--space-xs);
		}
	}
</style>
