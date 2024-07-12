<script lang="ts">
	import type { TradingEntityHit } from '$lib/search/trading-entities';
	import { createEventDispatcher } from 'svelte';
	import { Button, Spinner, TextInput } from '$lib/components';
	import { SearchHit } from '$lib/search/components';
	import SearchHitAdvanced from './SearchHitAdvanced.svelte';
	import SortSelect from './SortSelect.svelte';
	import IconFilter from '~icons/local/filter';

	const dispatch = createEventDispatcher();

	export let q: string;
	export let sortBy: string;
	export let hasSearch: boolean;
	export let hits: TradingEntityHit[] = [];
	export let loading: boolean;

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
			<Button secondary size="md" on:click={() => dispatch('showFilters')}>
				<IconFilter slot="icon" --icon-size="1.5rem" />
			</Button>
		</div>
	</div>

	<div class="results" class:loading>
		{#if hasSearch && hits.length}
			<ul>
				{#each hits as { document } (document.id)}
					<SearchHitAdvanced {document} />
				{/each}
			</ul>
		{:else if hasSearch && loading}
			<ul>
				{#each Array(3) as _}
					<SearchHit />
				{/each}
			</ul>
		{:else if hasSearch}
			<div class="prompt">No results found – try modifying your search query or removing filters.</div>
		{:else}
			<div class="prompt">Search exchanges, tokens, trading pairs and lending reserves.</div>
		{/if}

		<div class="spinner">
			<Spinner size="60" />
		</div>
	</div>
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

	.results {
		position: relative;

		> * {
			transition: opacity var(--time-xxs);
		}
	}

	ul {
		display: grid;
		gap: var(--space-md);
		padding: 0;

		.loading > & {
			opacity: 0.75;
			pointer-events: none;
		}
	}

	.spinner {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translate(-50%, 4em);
		pointer-events: none;

		:not(.loading) > & {
			opacity: 0;
		}
	}

	.prompt {
		height: calc(100vh - 28rem);
		font: var(--f-h4-roman);
	}
</style>
