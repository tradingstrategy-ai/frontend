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
	import { session } from '$app/stores';
	import tradingEntitiesStore from './trading-entities';
	import TradingEntityHit from './TradingEntityHit.svelte';
	import TextInput from '$lib/components/TextInput.svelte';
	import Button from '$lib/components/Button.svelte';

	const tradingEntities = tradingEntitiesStore($session.config.typesense);

	let q = '';
	let hasFocus = false;
	let selectedIndex = 0;
	let resultCount = 0;

	$: tradingEntities.search({
		q,
		sort_by: ['type_rank:asc', 'liquidity:desc', '_text_match:desc'],
		group_by: ['type']
	});

	$: hits = q ? $tradingEntities.hits : [];

	$: {
		resultCount = hits.length;
		selectedIndex = Math.min(selectedIndex, Math.max(resultCount - 1, 0));
	}

	function handleKeydown(event) {
		switch (event.key) {
			case 'ArrowDown':
				selectedIndex = (selectedIndex + 1) % resultCount;
				break;
			case 'ArrowUp':
				selectedIndex = (selectedIndex + resultCount - 1) % resultCount;
				break;
			case 'Enter':
				goto($tradingEntities.hits[selectedIndex].document.url_path);
				break;
			default:
				return;
		}
		event.preventDefault();
	}
</script>

<div
	class="search"
	on:focus|capture={() => (hasFocus = true)}
	on:blur|capture={() => (hasFocus = false)}
	on:keydown={handleKeydown}
>
	<TextInput
		type="search"
		data-cy="search"
		placeholder="Search"
		autocapitalize="none"
		spellcheck="false"
		bind:value={q}
	/>

	{#if hasFocus}
		<div class="results" transition:fade={{ duration: 250 }}>
			{#if q}
				<ul>
					{#each hits as { document }, index (document.id)}
						<TradingEntityHit
							{document}
							layout="basic"
							selected={index === selectedIndex}
							on:mouseenter={() => (selectedIndex = index)}
						/>
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

<style>
	.search {
		position: relative;
		--text-input-width: 100%;
	}

	.results {
		position: absolute;
		z-index: 1;
		right: 0;
		width: 450px;
		margin-top: 0.25rem;

		display: grid;
		gap: 1rem;
		padding: 0.75rem 0.625rem;
		background: var(--c-body);
		box-shadow: 0 0 0 1px var(--c-shadow-1), 0 4px 20px var(--c-shadow-1);
	}

	ul {
		display: grid;
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

	@media (max-width: 576px) {
		.search {
			position: revert;
		}

		.results {
			width: 100vw;
			border-radius: 0;
			border-left-width: 0;
			border-right-width: 0;
		}
	}
</style>
