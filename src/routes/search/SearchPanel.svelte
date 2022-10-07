<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Icon, TextInput } from '$lib/components';
	import TradingEntityHit from '$lib/search/TradingEntityHit.svelte';
	import SortSelect from './SortSelect.svelte';

	const dispatch = createEventDispatcher();

	export let q: string;
	export let sortOption: string;
	export let hasSearch: boolean;
	export let hits: [] = [];
</script>

<div class="search-panel">
	<div class="search-bar">
		<TextInput
			size="xl"
			type="search"
			data-cy="search"
			placeholder="Search"
			autocapitalize="none"
			spellcheck="false"
			bind:value={q}
		/>
		<div class="sort-select">
			<SortSelect bind:value={sortOption} />
		</div>
		<button class="filter-toggle" on:click={() => dispatch('toggleFilterPanel')}>
			<Icon name="filter" />
		</button>
	</div>

	{#if hasSearch}
		<ul>
			{#each hits as { document } (document.id)}
				<TradingEntityHit {document} layout="advanced" />
			{/each}
		</ul>
	{:else}
		<div>Search exchanges, tokens and trading pairs.</div>
	{/if}
</div>

<style lang="postcss">
	.search-panel {
		display: grid;
		grid-template-rows: auto 1fr;
		align-items: start;
		gap: 2.5rem;

		@media (--viewport-sm-down) {
			gap: 1.5rem;
		}
	}

	.search-bar {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1em;

		@media (--viewport-md-down) {
			height: 3.5rem;
			--text-input-height: 100%;
		}
	}

	.sort-select {
		@media (--viewport-md-down) {
			display: none;
		}
	}

	.filter-toggle {
		width: 3.5rem;
		border: 2px solid var(--c-border-2);
		border-radius: 0.5em;
		font-size: 1.25rem;
		background: var(--c-body);
		color: var(--c-text-1);

		@media (--viewport-lg-up) {
			display: none;
		}
	}

	ul {
		display: grid;
		gap: 2rem;
		padding: 0;

		@media (--viewport-sm-down) {
			gap: 1.25rem;
		}
	}
</style>
