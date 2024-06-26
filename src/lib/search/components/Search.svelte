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
	import { Button, Icon, Spinner, TextInput } from '$lib/components';
	import { disableScroll } from '$lib/actions/scroll';
	import { setViewportHeight } from '$lib/actions/viewport';

	let q = '';
	let hasFocus = false;

	$: hasQuery = q.trim() !== '';

	$: tradingEntities.search({
		q,
		sort_by: ['type_rank:asc', 'tvl:desc', 'pair_swap_fee:asc'],
		group_by: ['type']
	});

	$: loading = $tradingEntities.loading;
	$: hits = hasQuery ? $tradingEntities.hits : [];
</script>

<svelte:body use:disableScroll={hasFocus} />

<div
	class="search"
	class:hasQuery
	data-testid="nav-search"
	use:setViewportHeight
	on:focus|capture={() => (hasFocus = true)}
	on:blur|capture={() => (hasFocus = false)}
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

	<div class="dialog">
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

			<div class="results" class:loading>
				{#if hasQuery && hits.length}
					<ul>
						{#each hits as { document } (document.id)}
							<SearchHit {document} />
						{/each}
					</ul>
				{:else if hasQuery && loading}
					<ul>
						{#each Array(4) as _}
							<SearchHit />
						{/each}
					</ul>
				{:else if hasQuery}
					<div class="prompt">
						No results found.<br />
						Modify your query or try advanced search.
					</div>
				{:else}
					<div class="prompt">
						Search exchanges, tokens<br />
						trading pairs and lending reserves.
					</div>
				{/if}

				{#if hasQuery && loading}
					<Spinner size="60" />
				{/if}
			</div>

			<div class="ctas">
				{#if hasQuery}
					<Button size="sm" label="Show all results" href="/search?q={q}" tabindex={0} />
				{/if}
				<Button size="sm" label="Advanced search" href="/search?q={q}" tabindex={0} />
			</div>
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

	.dialog {
		--text-input-height: 2.875rem;
		background: var(--c-body);
		box-shadow: var(--shadow-3);
		overflow: hidden;
		position: absolute;
		right: 0;
		top: var(--space-4xl);
		z-index: 999;
		transition: opacity var(--time-md);

		/* hide dialog and disable pointer events when not focused */
		:not(:focus-within) & {
			opacity: 0;
			pointer-events: none;
		}

		/* desktop layout - floating dialog, fixed width, max height within viewport */
		@media (--search-layout-desktop) {
			border: 1px var(--c-box-3) solid;
			border-radius: var(--radius-md);
			margin-top: var(--space-xxs);
			width: 450px;
			max-height: calc(var(--viewport-height) - var(--space-xl) - var(--header-height, 5rem) / 2);
		}

		/* mobile layout - fixed, full width, full height when active search (hasQuery) */
		@media (--search-layout-mobile) {
			left: 0;
			top: 0;
			border-bottom: 1px var(--c-box-3) solid;

			.hasQuery & {
				height: var(--viewport-height);
				border: none;
			}
		}

		.inner {
			display: flex;
			flex-direction: column;
			gap: var(--space-md);
			height: inherit;
			max-height: inherit;
			padding: var(--space-md);
			background: var(--c-box-1);
		}
	}

	.results {
		flex: 1;
		display: grid;
		overflow: auto;

		> :global(*) {
			grid-area: 1 / -1;
		}
	}

	ul {
		padding: 0;
		display: grid;
		gap: var(--space-sm);
		align-content: start;
		overflow-y: auto;
		overscroll-behavior: contain;
		transition: opacity var(--time-xs);

		.loading & {
			opacity: 0.75;
			pointer-events: none;
		}
	}

	:global(.spinner) {
		justify-self: center;
		margin-top: 25%;
		pointer-events: none;
	}

	.prompt {
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
</style>
