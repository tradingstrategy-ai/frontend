<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Button, TextInput } from '$lib/components';
	import SearchHitAdvanced from './SearchHitAdvanced.svelte';
	import SortSelect from './SortSelect.svelte';

	const dispatch = createEventDispatcher();

	export let q: string;
	export let sortBy: string;
	export let hasSearch: boolean;
	export let hits: [] = [];

	function handleKeydown({ key, target }: KeyboardEvent) {
		if (key === 'Enter') {
			(target as HTMLInputElement).blur();
		}
	}
</script>

<div class="search-panel">
	<div class="search-bar">
		<TextInput
			bind:value={q}
			type="search"
			size="xl"
			placeholder="Search"
			autocapitalize="none"
			spellcheck="false"
			on:keydown={handleKeydown}
		/>
		<div class="sort-select">
			<SortSelect bind:value={sortBy} />
		</div>
		<div class="filter-toggle">
			<Button secondary size="md" icon="filter" on:click={() => dispatch('showFilters')} />
		</div>
	</div>

	{#if hasSearch && hits.length > 0}
		<ul>
			{#each hits as { document } (document.id)}
				<SearchHitAdvanced {document} />
			{/each}
		</ul>
	{:else if hasSearch}
		<div class="fallback">No results found &ndash; try modifying your search query or removing filters.</div>
	{:else}
		<div class="fallback">Search exchanges, tokens, trading pairs and lending reserves.</div>
	{/if}
</div>

<style lang="postcss">
	.search-panel {
		display: grid;
		grid-template-rows: auto 1fr;
		align-items: start;
		gap: var(--space-3xl);

		@media (--viewport-sm-down) {
			gap: var(--space-lg);
		}
	}

	.search-bar {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1em;

		@media (--viewport-md-down) {
			height: 3.5rem;
			--text-input-width: 100%;
			--text-input-height: 100%;
		}

		:global input:not(:placeholder-shown) {
			font-weight: 700;
		}
	}

	.sort-select {
		@media (--viewport-md-down) {
			display: none;
		}
	}

	.filter-toggle {
		@media (--viewport-lg-up) {
			display: none;
		}
	}

	ul {
		display: grid;
		gap: var(--space-md);
		padding: 0;
	}

	.fallback {
		height: calc(100vh - 28rem);
		font: var(--f-h4-roman);
	}
</style>
