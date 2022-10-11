<!--
@component
Display site-wide search box for use in top-nav.
- used for limited inline results; advanced search available through `/search` page
- uses (tradingstrategy/search)[https://github.com/tradingstrategy-ai/search] backend

#### Usage:
```tsx
<Search />
```
-->
<script lang="ts">
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import tradingEntities from './trading-entities';
	import TradingEntityHit from './TradingEntityHit.svelte';
	import { TextInput, Button } from '$lib/components';

	let q = '';
	let hasFocus = false;

	$: tradingEntities.search({
		q,
		sort_by: ['type_rank:asc', 'liquidity:desc', '_text_match:desc'],
		group_by: ['type']
	});

	$: hits = q ? $tradingEntities.hits : [];

	function handleKeydown({ key }: { key: string }) {
		if (key === 'Enter') {
			goto(`/search?q=${q}`);
		}
	}
</script>

<div class="search" on:focus|capture={() => (hasFocus = true)} on:blur|capture={() => (hasFocus = false)}>
	<TextInput
		bind:value={q}
		type="search"
		data-cy="search"
		placeholder="Search"
		autocapitalize="none"
		spellcheck="false"
		on:keydown={handleKeydown}
	/>

	{#if hasFocus}
		<div class="results" transition:fade={{ duration: 250 }}>
			{#if q}
				<ul>
					{#each hits as { document }, index (document.id)}
						<TradingEntityHit {document} layout="basic" />
					{/each}
				</ul>
			{/if}

			<div class="buttons">
				{#if q}
					<Button label="Show all results" href="/search?q={q}" />
				{:else}
					Search exchanges, tokens and trading pairs.
				{/if}
				<Button secondary label="Advanced search" href="/search?q={q}" />
			</div>
		</div>
	{/if}
</div>

<style lang="postcss">
	.search {
		--text-input-width: 100%;

		@media (width >= 576px) {
			position: relative;
		}
	}

	.results {
		position: absolute;
		z-index: 1;
		right: 0;
		width: 100%;
		margin-top: 0.25rem;

		display: grid;
		gap: 1rem;
		padding: 0.75rem 0.625rem;
		background: var(--c-body);
		box-shadow: 0 0 0 1px var(--c-shadow-1), 0 4px 20px var(--c-shadow-1);

		@media (width >= 576px) {
			width: 450px;
		}
	}

	ul {
		display: grid;
		gap: 1rem;
		padding: 0;
	}

	.buttons {
		display: grid;
		gap: 0.75rem;
		font: 500 var(--fs-ui-md);
		letter-spacing: 0.01em;
		color: var(--c-text-7);
		text-align: center;
	}
</style>
