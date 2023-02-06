<script lang="ts">
	export let value: string;
	import { TextInput } from '$lib/components';
</script>

<tr class="search">
	<th colspan="100">
		<div>
			<TextInput bind:value class="text-field" placeholder="Find in the table" size="lg" type="search" />
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

	.search :global .text-input {
		width: 100% !important;
	}

	tr.search {
		position: sticky;
		top: 3rem;
	}
</style>
