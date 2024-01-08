<script lang="ts">
	export let tableData: any;
</script>

<table class="long-short-table sm">
	<thead>
		<tr>
			<th class="name">Metric</th>
			{#each tableData.columns as column}
				<th class={column.toLowerCase()}>
					{column}
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each Object.values(tableData.rows) as row (row.kind)}
			<tr>
				<td class="name">{row.name}</td>
				{#each tableData.columns as column}
					<td class={column.toLowerCase()}>
						{row.value[column]}
					</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<style lang="postcss">
	.long-short-table {
		/* This should not require extra precidence in order to be applied */
		/* Look at table.css to reduce default table style precidence */
		:is(th, td):not(.name) {
			text-align: right;
		}

		td.name {
			color: hsl(var(--hsl-text-light));
		}
	}
</style>
