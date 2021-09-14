<script>
	import { onMount } from 'svelte';

	export let rows = [];
	let page = 0;
	let totalPages = [];
	let currentPageRows = [];
	let itemsPerPage = 5;
	let loading = true;

	$: currentPageRows = totalPages.length > 0 ? totalPages[page] : [];
	$: console.log('Page is', page);

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
			<th>id</th>
			<th>name</th>
			<th>USD Volume</th>
		</tr>
	</thead>

	<tbody>
		{#each currentPageRows as row, i}
			<tr>
				<td>{row.id}</td>
				<td>{row.name}</td>
				<td>{row.volume}</td>
			</tr>
		{:else}
			<tr>
				<td colspan="100%">
					<h5 class="text-center">There is no data to display here.</h5>
				</td>
			</tr>
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
