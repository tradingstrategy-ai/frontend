<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Icon, TextInput } from '$lib/components';
	import TradingEntityHit from '$lib/search/TradingEntityHit.svelte';
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
		<button class="filter-toggle" on:click={() => dispatch('showFilters')}>
			<Icon name="filter" />
		</button>
	</div>

	{#if hasSearch && hits.length > 0}
		<ul>
			{#each hits as { document } (document.id)}
				<TradingEntityHit {document} layout="advanced" />
			{/each}
		</ul>
	{:else if hasSearch}
		<div class="fallback">No results found &ndash; try modifying your search query or removing filters.</div>
	{:else}
		<div class="fallback">Search exchanges, tokens and trading pairs.</div>
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
			--text-input-font: var(--f-ui-lg-bold);
		}

		& :global input:not(:placeholder-shown) {
			font-weight: 700;
		}
	}

	.sort-select {
		@media (--viewport-md-down) {
			display: none;
		}
	}

	.filter-toggle {
		width: 3.5rem;
		padding: 0;
		border: 2px solid var(--c-border-2-v1);
		border-radius: 0.5em;
		font-size: 1.25rem;
		background: var(--c-body-v1);
		color: var(--c-text-1-v1);

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
