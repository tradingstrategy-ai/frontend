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
		border-radius: 0 !important;
		padding: 0 0 var(--space-sl) !important;
	}

	div {
		max-width: calc(100vw - 3rem);
	}

	.search :global .text-input {
		width: 100% !important;
	}

	tr.search {
		position: sticky;
		top: 3.5rem;
		z-index: 1;
	}
</style>
