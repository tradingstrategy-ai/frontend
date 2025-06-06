<!--
@component
Display site-wide search box for use in top-nav.
- used for limited inline results; advanced search available through `/search` page
- uses (tradingstrategy/search)[https://github.com/tradingstrategy-ai/search] backend

@example

```svelte
<Search />
```
-->
<script lang="ts">
	import tradingEntities from '../trading-entities';
	import SearchHit from './SearchHit.svelte';
	import { Button, Spinner, TextInput } from '$lib/components';
	import IconSearch from '~icons/local/search';
	import { disableScroll } from '$lib/actions/scroll';

	let q = '';
	let hasFocus = false;

	$: hasQuery = q.trim() !== '';

	$: tradingEntities.search(fetch, {
		q,
		sort_by: ['type_rank:asc', 'tvl:desc', 'liquidity:desc'],
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
	on:focus|capture={() => (hasFocus = true)}
	on:blur|capture={() => (hasFocus = false)}
>
	<label class="mobile-only" for="search-input-mobile" aria-label="search-mobile">
		<IconSearch />
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
						{#each Array(3) as _}
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

				<div class="spinner">
					<Spinner size="60" />
				</div>
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

<style>
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

	.dialog {
		--text-input-height: 2.875rem;
		position: absolute;
		right: 0;
		z-index: 999;
		background: var(--c-body);
		box-shadow: var(--shadow-3);
		overflow: hidden;
		transition: opacity var(--time-md);

		/* hide dialog and disable pointer events when not focused */
		:not(:focus-within) & {
			opacity: 0;
			pointer-events: none;
		}

		/* desktop layout - floating dialog, fixed width, max height within viewport */
		@media (--search-layout-desktop) {
			top: var(--space-4xl);
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
		position: relative;
		overflow: auto;

		> * {
			transition: all var(--time-xxs) allow-discrete;
		}
	}

	ul {
		padding: 0;
		display: grid;
		gap: var(--space-sm);
		align-content: start;
		overflow-y: auto;
		overscroll-behavior: contain;

		.loading & {
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
			display: none;
			opacity: 0;
		}
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
			:global([data-css-props]) {
				--button-font: var(--f-ui-sm-medium);
				--button-letter-spacing: var(--ls-ui-sm, var(--f-ui-sm-spacing));
			}
		}
	}
</style>
