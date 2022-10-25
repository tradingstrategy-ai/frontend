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
	import tradingEntities from './trading-entities';
	import TradingEntityHit from './TradingEntityHit.svelte';
	import { Button, Icon, TextInput } from '$lib/components';

	let q = '';
	let hasFocus = false;

	$: tradingEntities.search({
		q,
		sort_by: ['type_rank:asc', 'liquidity:desc', '_text_match:desc'],
		group_by: ['type']
	});

	$: hits = q ? $tradingEntities.hits : [];

	async function toggleFocus() {
		setTimeout(() => (hasFocus = !hasFocus));
	}
</script>

<div class="search" class:hasFocus on:focus|capture={toggleFocus} on:blur|capture={toggleFocus}>
	<label class="mobile-only" for="search-input-mobile">
		<Icon name="search" />
	</label>

	<form class="desktop-only" action="/search">
		<!-- prettier-ignore -->
		<TextInput
			bind:value={q}
			name="q"
			type="search"
			placeholder="Search"
			autocomplete="off"
			autocapitalize="none"
			spellcheck="false"
		/>
	</form>

	<div class="results">
		<form class="mobile-only" action="/search">
			<TextInput
				bind:value={q}
				id="search-input-mobile"
				name="q"
				size="lg"
				type="search"
				placeholder="Search"
				autocomplete="off"
				autocapitalize="none"
				spellcheck="false"
			/>
		</form>

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
</div>

<style lang="postcss">
	@custom-media --search-layout-mobile (width < 576px);
	@custom-media --search-layout-desktop (width >= 576px);

	@media (--search-layout-mobile) {
		.desktop-only {
			display: none;
		}
	}

	@media (--search-layout-desktop) {
		.mobile-only {
			display: none;
		}
	}

	.search {
		--text-input-width: 100%;

		@media (--search-layout-mobile) {
			display: grid;
			justify-items: end;
		}

		@media (--search-layout-desktop) {
			position: relative;
		}
	}

	label {
		display: grid;
		align-items: center;
		height: 100%;
		margin-right: -0.5rem;
		font-size: 20px;
	}

	.results {
		position: absolute;
		z-index: 1;
		right: 0;
		display: grid;
		gap: 1rem;
		padding: 0.75rem 0.625rem;
		background: var(--c-body);
		box-shadow: 0 0 0 1px var(--c-shadow-1), 0 4px 20px var(--c-shadow-1);
		transition: opacity 0.25s;
		--text-input-height: 2.875rem;

		@media (--search-layout-desktop) {
			width: 450px;
			margin-top: 0.25rem;
		}

		@media (--search-layout-mobile) {
			left: 0;
			top: 0;
		}

		@nest :not(.hasFocus) & {
			opacity: 0;
			pointer-events: none;
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
