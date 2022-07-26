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
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import tradingEntitiesStore from './trading-entities';
	import { Fade } from 'sveltestrap';
	import TradingEntityHit from './TradingEntityHit.svelte';
	import TextInput from '$lib/components/TextInput.svelte';

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

	$: {
		resultCount = $tradingEntities.hits.length;
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

<div class="search">
	<TextInput
		type="search"
		data-cy="search"
		placeholder="Search"
		autocapitalize="none"
		spellcheck="false"
		bind:value={q}
		on:focus={() => (hasFocus = true)}
		on:blur={() => (hasFocus = false)}
		on:keydown={handleKeydown}
	/>
	<Fade isOpen={hasFocus && q}>
		<div class="card bg-primary shadow-soft border-light">
			<ul class="list-group flush">
				{#each $tradingEntities.hits as { document }, index (document.id)}
					<TradingEntityHit
						{document}
						layout="basic"
						selected={index === selectedIndex}
						on:mouseenter={() => (selectedIndex = index)}
					/>
				{/each}
				<li class="show-all list-group-item">
					<a href="/search?q={q}" on:mousedown|preventDefault> Show all results | Advanced search </a>
				</li>
			</ul>
		</div>
	</Fade>
</div>

<style>
	.search {
		position: relative;
		--text-input-width: 100%;
	}

	.card {
		position: absolute;
		z-index: 1;
		right: 0;
		width: 450px;
		margin-top: 5px;
	}

	.show-all {
		padding: 0;
		background-color: var(--c-parchment-extra-dark);
	}

	.show-all a {
		display: block;
		text-align: center;
		padding: 0.5em;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.show-all:hover {
		filter: brightness(0.9);
	}

	@media (max-width: 576px) {
		.search {
			position: revert;
		}

		.card {
			width: 100vw;
			border-radius: 0;
			border-left-width: 0;
			border-right-width: 0;
		}

		.card :global(.list-group-item) {
			border-radius: 0 !important;
		}
	}
</style>
