<script lang="typescript">
	import { onMount } from 'svelte';
	import { formatNumber } from '$lib/helpers/formatters';

	export let rows = [];
	export let apiError;
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
			<th>Quote</th>
			<th>Volume 24h</th>
			<th>Liquidity</th>
			<th>Price</th>
		</tr>
	</thead>

	<tbody>
		{#each currentPageRows as row, i}
			<tr>
				<td>{row.base_token_symbol}/{row.quote_token_symbol}</td>
				<td>{formatNumber(row.usd_volume_1d)}</td>
				<td>{formatNumber(row.usd_liquidity_high_24h)}</td>
				<td>{formatNumber(row.usd_price_15m_close)}</td>
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
<nav class="pagination">
	<ul>
		<li>
			<button
				type="button"
				class="btn btn-primary form-group-api-key-item s-corywHGE_LaK btn-next-prev"
				on:click={() => setPage(page - 1)}
			>
				PREV
			</button>
		</li>

		{#each totalPages as page, i}
			<li>
				<button
					type="button"
					class="btn btn-primary form-group-api-key-item s-corywHGE_LaK btn-page-number"
					on:click={() => setPage(i)}
				>
					{i + 1}
				</button>
			</li>
		{/each}

		<li>
			<button
				type="button"
				class="btn btn-primary form-group-api-key-item s-corywHGE_LaK btn-next-prev"
				on:click={() => setPage(page + 1)}
			>
				NEXT
			</button>
		</li>
	</ul>
</nav>

<style>
	nav > ul {
		list-style-type: none;
		display: flex;
	}
	button {
		margin-right: 6px;
	}
</style>
