<script lang="ts">
	export let label: string;
	export let value: string;
	export let href: string = '';
	let className: string = '';
	export { className as class };
</script>

<tr>
	<th scope="row">{label}</th>
	<td class={className}>
		{#if href}
			<a {href}>{value}</a>
		{:else}
			{value}
		{/if}
	</td>
</tr>

<style lang="postcss">
	tr {
		&:not(:first-child) > * {
			padding-top: 0.375rem;
		}

		&:not(:last-child) > * {
			padding-bottom: 0.375rem;
		}

		& th {
			font: var(--f-ui-large-medium);
		}

		& td {
			font: var(--f-ui-large-bold);
		}

		& :global a {
			font: inherit;
			text-decoration: underline;
		}
	}
</style>
