<script lang="ts">
	export let value: string;
</script>

<tr class="search">
	<th colspan="100">
		<div>
			<input bind:value class="text-field" type="search" placeholder="Find in the table" />
		</div>
	</th>
</tr>

<style lang="postcss">
	th {
		padding: var(--space-sl) 0 !important;
	}

	div {
		max-width: calc(100vw - 3rem);
	}

	input {
		width: 100%;
	}

	tr.search {
		position: sticky;
		top: 3rem;
	}
</style>
