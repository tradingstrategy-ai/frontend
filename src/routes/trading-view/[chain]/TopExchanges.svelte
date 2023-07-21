<script lang="ts">
	import { formatDollar } from '$lib/helpers/formatters';

	export let loading = false;
	export let rows: Record<string, any>[] = Array(5).fill({});
</script>

<table class="top-exchanges" class:loading>
	<tbody>
		{#each rows as row}
			{@const href = loading ? undefined : `/trading-view/${row.chain_slug}/${row.exchange_slug}`}
			<svelte:element this={href ? 'a' : 'span'} style:display="contents" {href}>
				<tr>
					<td class="exchange-name">
						{row.human_readable_name ?? '---'}
					</td>
					<td class="volume">
						{formatDollar(row.usd_volume_30d)}
					</td>
				</tr>
			</svelte:element>
		{/each}
	</tbody>
</table>

<style lang="postcss">
	.top-exchanges {
		table-layout: fixed;

		& .exchange-name {
			width: 75%;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		& .volume {
			width: 25%;
			text-align: right;
			--cell-padding: 0 var(--space-md) 0 var(--space-xs);
		}
	}
</style>
