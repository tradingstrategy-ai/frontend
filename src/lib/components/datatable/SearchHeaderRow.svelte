<script lang="ts">
	export let value: string;
</script>

<tr>
	<th colspan="100">
		<div>
			<input bind:value class="text-field" type="search" placeholder="Find in the table" />
		</div>
	</th>
</tr>

<style lang="postcss">
	th {
		padding: 0.5rem 0;
	}

	div {
		max-width: calc(100vw - 3rem);
	}

	input {
		width: 100%;
	}
</style>
