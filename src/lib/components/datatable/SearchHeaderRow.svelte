<script lang="ts">
	export let value: string;
	import { TextInput } from '$lib/components';
</script>

<tr class="search">
	<th colspan="100">
		<TextInput bind:value type="search" size="md" placeholder="Find in table" />
	</th>
</tr>

<style>
	tr.search {
		position: sticky;
		top: 3.5rem;
		left: 0;
		z-index: 1;

		th {
			border-radius: 0 !important;
			padding: 0 0 var(--space-sl) !important;
			--text-input-width: 100%;
			--text-input-max-width: calc(100vw - 3rem);

			/* FIXME: overriding radius for now due to inconsistencies with radius.css and radius-new.css */
			--radius-xs: 0.75rem;
		}
	}
</style>
