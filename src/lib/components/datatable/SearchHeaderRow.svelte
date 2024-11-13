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
	.search {
		position: sticky;
		top: 3.5rem;
		z-index: 3;

		th {
			padding-top: var(--border-spacing);
			transform: translateY(calc(-1 * var(--border-spacing)));

			--text-input-width: 100%;
			--text-input-max-width: calc(100vw - 2 * var(--container-margin));
			/* FIXME: overriding radius for now due to inconsistencies with radius.css and radius-new.css */
			--radius-xs: 0.75rem;
		}
	}
</style>
