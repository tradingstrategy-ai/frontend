<!--
@component
Renders a vault's registered strategy categories as links to strategy listings.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { VaultCategoryLink } from '$lib/top-vaults/categories';

	interface Props {
		categories: VaultCategoryLink[];
	}

	let { categories }: Props = $props();
</script>

{#if categories.length > 0}
	<p class="vault-categories">
		<span class="label">Strategy categories:</span>
		{#each categories as category, index (category.slug)}
			<span class="category-link"
				>{index > 0 ? ', ' : ''}<a href={resolve(`/vaults/strategies/${category.slug}`)}>{category.label}</a></span
			>
		{/each}
	</p>
{/if}

<style>
	.vault-categories {
		margin: 1rem 0 0;
		color: var(--c-text-extra-light);
		font: var(--f-ui-md-roman);

		@media (--viewport-sm-down) {
			font: var(--f-ui-sm-roman);
		}
	}

	.label {
		margin-right: 0.4em;
		color: var(--c-text-light);
		font-weight: 600;
	}

	.category-link {
		white-space: nowrap;
	}

	a {
		color: var(--c-text);
		font-weight: 600;
		text-decoration: underline;

		&:hover {
			color: var(--c-text-light);
		}
	}
</style>
