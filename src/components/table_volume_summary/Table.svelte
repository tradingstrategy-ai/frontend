<script lang="typescript">
	import { ApiError } from '$lib/models/exchanges.svelte';
	import { onMount } from 'svelte';
	import { formatNumber } from '$lib/helpers/utils';

	export let rows = [];
	export let apiError: ApiError;
	let page = 0;
	let totalPages = [];
	let currentPageRows = [];
	let itemsPerPage = 50;
	let loading = true;

	$: currentPageRows = totalPages.length > 0 ? totalPages[page] : [];
  
	const paginate = (items) => {
		const pages = Math.ceil(items.length / itemsPerPage);

		const paginatedItems = Array.from({ length: pages }, (_, index) => {
			const start = index * itemsPerPage;
			return items.slice(start, start + itemsPerPage);
		});

		totalPages = [...paginatedItems];
	};

	onMount(() => {
		paginate(rows);
	});

	const setPage = (p) => {
		if (p >= 0 && p < totalPages.length) {
			page = p;
		}
	};
</script>

<table class="table table-datasets">
	<thead>
		<tr>
			<th></th>
			<th>Volume (USD)</th>
			<th>Trades</th>
		</tr>
	</thead>

	<tbody>
		{#each currentPageRows as row, i}
			<tr>
				<td>{row.period}</td>
				<td>{formatNumber(row.volume)}</td>
				<td>{formatNumber(row.trade)}</td>
			</tr>
		{:else}
			{#if apiError}
				<tr>
					<td>
						<h5 class="text-center">Api unavailabe, {apiError} </h5>
					</td>
				</tr>
			{:else}
				<tr>
					<td>
						<h5 class="text-center">There is no data to display here.</h5>
					</td>
				</tr>
			{/if}
		{/each}
	</tbody>
</table>

<style>
	nav > ul {
		list-style-type: none;
		display: flex;
	}
	button {
		margin-right: 6px;
	}
</style>
