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

	$: hasQuery = q.trim() !== '';

	$: tradingEntities.search({
		q,
		sort_by: ['type_rank:asc', 'liquidity:desc', '_text_match:desc'],
		group_by: ['type']
	});

	$: hits = hasQuery ? $tradingEntities.hits : [];

	// use event loop to allow click on result anchor tags to propogate before dialog closes
	function toggleFocus() {
		setTimeout(() => (hasFocus = !hasFocus));
	}

	/**
	 * Mobile Safari does not correctly reflect viewport height with % or vh units when virtual
	 * keyboard is open (grr!). It does, however, support the VisualViewport JS API for getting the
	 * (real) visual viewport size. See:
	 * https://developer.mozilla.org/en-US/docs/Web/API/Visual_Viewport_API
	 */
	function setViewportHeight(node: HTMLElement) {
		const { visualViewport } = window;
		if (!visualViewport) return;

		const setCssVar = () => {
			node.style.setProperty('--viewport-height', `${visualViewport.height}px`);
		};

		setCssVar();
		visualViewport.addEventListener('resize', setCssVar);

		return {
			destroy: () => visualViewport.removeEventListener('resize', setCssVar)
		};
	}
</script>

<div
	class="search"
	class:hasFocus
	class:hasQuery
	data-testid="nav-search"
	use:setViewportHeight
	on:focus|capture={toggleFocus}
	on:blur|capture={toggleFocus}
>
	<label class="mobile-only" for="search-input-mobile" aria-label="search-mobile">
		<Icon name="search" />
	</label>

	<form class="desktop-only" action="/search" role="search">
		<TextInput
			bind:value={q}
			aria-label="search-desktop"
			name="q"
			type="search"
			placeholder="Search"
			autocomplete="off"
			autocapitalize="none"
			spellcheck="false"
		/>
	</form>

	<div class="results">
		<form class="mobile-only" action="/search" role="search">
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

		{#if hasQuery}
			<ul id="search-results">
				{#each hits as { document }, index (document.id)}
					<TradingEntityHit {document} layout="basic" />
				{/each}
			</ul>
		{/if}

		<div class="buttons">
			{#if hasQuery}
				<Button sm label="Show all results" href="/search?q={q}" />
			{:else}
				Search exchanges, tokens and trading pairs.
			{/if}
			<Button sm secondary label="Advanced search" href="/search?q={q}" />
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
		margin-right: -var(--space-ss);
		font-size: 20px;
	}

	.results {
		position: absolute;
		z-index: 1;
		right: 0;
		padding: var(--space-sl) var(--space-sm);
		display: flex;
		flex-direction: column;
		gap: var(--space-md);
		background: var(--c-body-v1);
		box-shadow: 0 0 0 1px var(--c-shadow-1-v1), 0 4px 20px var(--c-shadow-1-v1);
		transition: opacity 0.25s;
		--text-input-height: 2.875rem;

		/* NOTE: don't use native :focus-within due to timing issues (see toggleFocus) */
		@nest :not(.hasFocus) & {
			opacity: 0;
			pointer-events: none;
		}

		@media (--search-layout-desktop) {
			width: 450px;
			margin-top: var(--space-xxs);
			max-height: calc(100vh - 1.75rem - var(--header-height, 5rem) / 2);
		}

		@media (--search-layout-mobile) {
			left: 0;
			top: 0;

			@nest .hasQuery & {
				height: var(--viewport-height, 100vh);
				gap: var(--space-sm);
			}
		}
	}

	/**
	 * Prevent body scrolling when search dialog is open and has results on mobile
	 * NOTE: using CSS ids as work-around for :has pseudo-selector flakiness
	 */
	:global body:has(#search-input-mobile:focus):has(#search-results) {
		overflow: hidden;
	}

	ul {
		padding: 0;
		flex: 1;
		display: grid;
		gap: var(--space-ss);
		align-content: start;
		overflow-y: auto;
	}

	.buttons {
		display: grid;
		gap: var(--space-sl) var(--space-sm);
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-md-spacing, normal);
		color: var(--c-text-7-v1);
		text-align: center;

		@nest .hasQuery & {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
