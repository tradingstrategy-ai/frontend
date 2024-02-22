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
	import tradingEntities from '../trading-entities';
	import SearchHit from './SearchHit.svelte';
	import { Button, Icon, TextInput } from '$lib/components';

	let q = '';
	let hasFocus = false;

	$: hasQuery = q.trim() !== '';

	$: tradingEntities.search({
		q,
		sort_by: ['type_rank:asc', 'tvl:desc', 'pool_swap_fee:asc'],
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
		<div class="inner">
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
				<ul>
					{#each hits as { document } (document.id)}
						<SearchHit {document} />
					{/each}
				</ul>
			{/if}

			<footer>
				{#if !hasQuery}
					<div class="prompt">
						Search exchanges, tokens<br />
						trading pairs and lending reserves.
					</div>
				{/if}
				<div class="ctas">
					{#if hasQuery}
						<Button size="sm" label="Show all results" href="/search?q={q}" />
					{/if}
					<Button size="sm" label="Advanced search" href="/search?q={q}" />
				</div>
			</footer>
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
		/* default --viewport-height; overriden by setViewportHeight action */
		--viewport-height: 100vh;
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
		--text-input-height: 2.875rem;

		background: var(--c-body);
		border: 1px var(--c-box-3) solid;
		box-shadow: var(--shadow-3);
		overflow: hidden;
		position: absolute;
		right: 0;
		top: var(--space-4xl);
		z-index: 999;
		transition: opacity 0.25s;

		/* NOTE: don't use native :focus-within due to timing issues (see toggleFocus) */
		:not(.hasFocus) & {
			opacity: 0;
			pointer-events: none;
		}

		@media (--search-layout-desktop) {
			border-radius: var(--radius-md);
			margin-top: var(--space-xxs);
			width: 450px;

			.inner {
				max-height: calc(var(--viewport-height) - var(--space-xl) - var(--header-height, 5rem) / 2);
			}
		}

		@media (--search-layout-mobile) {
			left: 0;
			top: 0;

			.hasQuery & .inner {
				height: var(--viewport-height);
				gap: var(--space-sm);
			}
		}

		.inner {
			background: var(--c-box-1);
			display: flex;
			flex-direction: column;
			gap: var(--space-md);
			padding: var(--space-md);
		}
	}

	ul {
		padding: 0;
		flex: 1;
		display: grid;
		gap: var(--space-sm);
		align-content: start;
		overflow-y: auto;
		overscroll-behavior: contain;
	}

	footer {
		.prompt {
			margin-bottom: var(--space-sl);
			font: var(--f-ui-md-medium);
			letter-spacing: var(--f-ui-md-spacing, normal);
			color: var(--c-text-extra-light);
			text-align: center;

			@media (--search-layout-mobile) {
				font: var(--f-ui-sm-medium);
			}
		}

		.ctas {
			display: grid;
			grid-auto-flow: column;
			grid-auto-columns: 1fr;
			gap: var(--space-sm);

			@media (--search-layout-mobile) {
				--button-font: var(--f-ui-sm-medium);
			}
		}
	}
</style>
