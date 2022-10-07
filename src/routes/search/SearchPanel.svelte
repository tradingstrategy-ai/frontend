<script lang="ts">
	import { TextInput } from '$lib/components';
	import TradingEntityHit from '$lib/search/TradingEntityHit.svelte';
	import SortSelect from './SortSelect.svelte';

	export let q: string;
	export let isOpen: boolean;
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
			on:focus={() => (isOpen = true)}
		/>
		<SortSelect bind:value={sortOption} />
		<!-- <button class:isOpen class="close-filters d-md-none" on:click={() => (isOpen = false)}>Done</button> -->
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
		gap: 1rem;
	}

	.search-bar {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1em;
	}

	button.close-filters {
		border: none;
		border-radius: 0.5em;
		height: 100%;
		padding: 0 1em;
		font-weight: 600;
		font-size: 0.75rem;
		letter-spacing: 0.02em;
		text-transform: uppercase;
		background: var(--c-background-3);
		color: var(--c-text-6);
	}

	ul {
		display: grid;
		gap: 1.5rem;
		padding: 1.5rem 0 0 0;
		max-width: 800px;

		@media (--viewport-sm-down) {
			gap: 0;
		}
	}

	@media (--viewport-sm-down) {
		.close-filters {
			display: none;
		}

		.sort-control {
			display: none;
		}
	}
</style>
