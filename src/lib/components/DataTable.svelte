<script lang="ts">
	import Button from '$lib/components/Button.svelte';

	export let data: any[] = [];
</script>

{#if data?.length}
	<div class="data-table">
		<table>
			<thead>
				<tr>
					{#each Object.keys(data[0]) as key, i}
						<th class:align-left={i < 2}>{key === 'Details' ? '' : key}</th>
					{/each}
				</tr>
			</thead>
			<tbody>
				{#each data as item}
					<tr>
						{#each Object.values(item) as value, i}
							{#if !value?.includes('/position-')}
								<td class:align-left={i < 2}>{value}</td>
							{:else}
								<td><Button tertiary href={value}>Details</Button></td>
							{/if}
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<style>
</style>
