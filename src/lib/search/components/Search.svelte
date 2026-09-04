<!--
@component
Reusable vault and DeFi entity search with navigation and in-page selector layouts.

The component fetches only public search suggestions; the server keeps the
underlying vault JSON index private.
-->
<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { SvelteURLSearchParams } from 'svelte/reactivity';
	import type { Snippet } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { disableScroll } from '$lib/actions/scroll';
	import { removeOnError } from '$lib/actions/image';
	import { formatDollar, formatPercent, notFilledMarker } from '$lib/helpers/formatters';
	import {
		formatVaultAddressPrefix,
		searchEntityColours,
		searchEntityLabels,
		type SearchResponse,
		type SearchResult
	} from '$lib/search/entities';
	import IconCancel from '~icons/local/cancel';
	import IconSearch from '~icons/local/search';
	import Spinner from '$lib/components/Spinner.svelte';
	import VaultSparkline from '$lib/top-vaults/VaultSparkline.svelte';

	interface Props {
		menu?: boolean;
		onNavigate?: () => void;
		/** Limit the suggestions to vaults when search is used as a vault selector. */
		scope?: 'all' | 'vaults';
		/** Use page formatting to keep the full search input and anchored result panel at every viewport size. */
		format?: 'navigation' | 'page';
		label?: string;
		inputLabel?: string;
		placeholder?: string;
		mobilePlaceholder?: string;
		showAllResults?: boolean;
		disabled?: boolean;
		/** Exclude vault suggestions below this latest TVL in USD. */
		minimumVaultTvlUsd?: number;
		/** Rank vault-scope results by latest TVL instead of textual relevance. */
		vaultSort?: 'relevance' | 'tvl';
		/** Optional action rendered beside each result. Call onAction after accepting the result. */
		addButton?: Snippet<[result: SearchResult, onAction: () => void]>;
	}

	let {
		menu = false,
		onNavigate,
		scope = 'all',
		format = 'navigation',
		label,
		inputLabel = 'Search vaults and DeFi entities',
		placeholder = 'Search vaults',
		mobilePlaceholder = 'Search vaults, curators, protocols and chains',
		showAllResults = true,
		disabled = false,
		minimumVaultTvlUsd,
		vaultSort = 'relevance',
		addButton
	}: Props = $props();

	const componentId = $props.id();
	const listboxId = `${componentId}-site-search-suggestions`;
	const TYPEAHEAD_DEBOUNCE_MS = 200;
	const TYPEAHEAD_LIMIT = 10;
	let query = $state('');
	let open = $state(false);
	let loading = $state(false);
	let errorMessage = $state<string | null>(null);
	let results = $state<SearchResult[]>([]);
	let selectedIndex = $state(-1);
	let mobileDialogOpen = $state(false);
	let requestSequence = 0;
	let desktopSearchInput = $state<HTMLInputElement>();
	let mobileSearchInput = $state<HTMLInputElement>();
	let searchTrigger = $state<HTMLButtonElement>();
	let searchRoot: HTMLDivElement;
	let ready = $state(false);

	let hasQuery = $derived(query.trim().length > 0);
	let dialogVisible = $derived(open && (format === 'navigation' || hasQuery));
	let activeOptionId = $derived(selectedIndex >= 0 ? `${listboxId}-${selectedIndex}` : undefined);

	onMount(() => {
		if (format === 'page' && desktopSearchInput) {
			// Browsers may restore the previous query across same-route GET submissions.
			// Page-embedded selectors should always start from a fresh, reactive query.
			desktopSearchInput.value = '';
			query = '';
		}
		ready = true;
		const inputWasFocusedBeforeHydration = desktopSearchInput?.dataset.prehydrationFocus === 'true';
		delete desktopSearchInput?.dataset.prehydrationFocus;
		if (!inputWasFocusedBeforeHydration) return;

		// Svelte hydration can blur an input that was tapped before its handlers loaded.
		requestAnimationFrame(() => desktopSearchInput?.focus({ preventScroll: true }));
	});

	$effect(() => {
		const searchQuery = query.trim();
		const sequence = ++requestSequence;
		selectedIndex = -1;
		errorMessage = null;
		if (!searchQuery) {
			loading = false;
			results = [];
			return;
		}
		open = true;
		loading = true;

		const controller = new AbortController();
		const timeout = setTimeout(async () => {
			try {
				const params = new SvelteURLSearchParams({
					q: searchQuery,
					limit: String(TYPEAHEAD_LIMIT),
					scope
				});
				if (minimumVaultTvlUsd !== undefined) {
					params.set('minimumVaultTvlUsd', String(minimumVaultTvlUsd));
				}
				if (scope === 'vaults' && vaultSort === 'tvl') params.set('sort', 'tvl');
				const response = await fetch(`/search/suggestions?${params}`, { signal: controller.signal });
				if (!response.ok) throw new Error('Search is temporarily unavailable.');
				const data = (await response.json()) as Partial<SearchResponse>;
				if (sequence === requestSequence) results = Array.isArray(data.results) ? data.results : [];
			} catch (error) {
				if ((error as Error).name !== 'AbortError' && sequence === requestSequence) {
					errorMessage = 'Search is temporarily unavailable.';
					results = [];
				}
			} finally {
				if (sequence === requestSequence) loading = false;
			}
		}, TYPEAHEAD_DEBOUNCE_MS);

		return () => {
			clearTimeout(timeout);
			controller.abort();
		};
	});

	$effect(() => {
		if (!open || mobileDialogOpen) return;

		function closeOnOutsidePointerDown(event: PointerEvent) {
			if (event.target instanceof Node && !searchRoot.contains(event.target)) closeSearch();
		}

		document.addEventListener('pointerdown', closeOnOutsidePointerDown);
		return () => document.removeEventListener('pointerdown', closeOnOutsidePointerDown);
	});

	function formatApy(value: number | null) {
		return value === null ? notFilledMarker : formatPercent(value, 1, 1);
	}

	function formatTvl(value: number | null) {
		return value === null ? notFilledMarker : formatDollar(value, 1, 1);
	}

	function openSearch() {
		mobileDialogOpen = true;
		open = true;
		tick().then(() => mobileSearchInput?.focus());
	}

	function closeSearch({ restoreFocus = false } = {}) {
		mobileDialogOpen = false;
		open = false;
		selectedIndex = -1;
		if (restoreFocus) tick().then(() => searchTrigger?.focus());
	}

	/** Reset selector-style search after its result action is activated. */
	function clearActionSearch() {
		query = '';
		results = [];
		closeSearch();
	}

	/** Close the quick-search UI before navigating to a search or entity page. */
	function closeSearchForNavigation() {
		closeSearch();
		onNavigate?.();
	}

	/** Trigger the action supplied for a result row instead of navigating away. */
	function activateResultAction(index: number): boolean {
		if (!addButton) return false;
		const actionButton = searchRoot.querySelectorAll<HTMLButtonElement>('.result-action button')[index];
		actionButton?.click();
		return true;
	}

	function handleResultClick(event: MouseEvent, index: number) {
		if (!activateResultAction(index)) {
			closeSearchForNavigation();
			return;
		}

		event.preventDefault();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault();
			closeSearch({ restoreFocus: true });
			return;
		}

		if (!results.length) return;
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = (selectedIndex + 1) % results.length;
		}
		if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = selectedIndex <= 0 ? results.length - 1 : selectedIndex - 1;
		}
		if (event.key === 'Enter' && selectedIndex >= 0) {
			event.preventDefault();
			if (!activateResultAction(selectedIndex)) {
				goto(resolve(results[selectedIndex].href as `/vaults/${string}`));
				closeSearchForNavigation();
			}
		}
	}

	function handleSubmit(event: SubmitEvent) {
		if (format === 'page') event.preventDefault();
		if (selectedIndex >= 0) {
			event.preventDefault();
			if (!activateResultAction(selectedIndex)) {
				goto(resolve(results[selectedIndex].href as `/vaults/${string}`));
			}
		}
		closeSearchForNavigation();
	}
</script>

<svelte:body use:disableScroll={mobileDialogOpen} />

<div
	bind:this={searchRoot}
	class="search"
	class:menu-search={menu}
	class:page-search={format === 'page'}
	data-ready={ready}
	data-testid={format === 'page' ? 'page-search' : menu ? 'mobile-menu-search' : 'nav-search'}
>
	{#if label}<label class="search-label" for={`${componentId}-desktop-input`}>{label}</label>{/if}
	<form class="desktop-search" action="/search" role="search" onsubmit={handleSubmit}>
		<input
			bind:this={desktopSearchInput}
			value={query}
			id={`${componentId}-desktop-input`}
			data-preserve-hydration-focus
			aria-activedescendant={activeOptionId}
			aria-autocomplete="list"
			aria-controls={listboxId}
			aria-expanded={dialogVisible}
			aria-label={inputLabel}
			role="combobox"
			name="q"
			type="search"
			{placeholder}
			autocomplete="off"
			autocapitalize="none"
			spellcheck="false"
			{disabled}
			onfocus={() => {
				mobileDialogOpen = false;
				open = true;
			}}
			oninput={(event) => {
				query = event.currentTarget.value;
				mobileDialogOpen = false;
				open = true;
			}}
			onkeydown={handleKeydown}
		/>
	</form>

	<button
		bind:this={searchTrigger}
		class="search-trigger"
		type="button"
		aria-label={menu ? 'Search vaults' : 'Open search'}
		aria-expanded={open}
		onclick={openSearch}
	>
		<IconSearch />
		{#if menu}<span>Search vaults</span>{/if}
	</button>

	{#if dialogVisible}
		<div class="dialog" role="dialog" aria-modal={mobileDialogOpen} aria-label="Search">
			{#if format === 'navigation'}
				<div class="mobile-search-row">
					<form action="/search" role="search" onsubmit={handleSubmit}>
						<input
							bind:this={mobileSearchInput}
							value={query}
							aria-activedescendant={activeOptionId}
							aria-autocomplete="list"
							aria-controls={listboxId}
							aria-expanded={dialogVisible}
							aria-label={inputLabel}
							role="combobox"
							name="q"
							type="search"
							placeholder={mobilePlaceholder}
							autocomplete="off"
							autocapitalize="none"
							spellcheck="false"
							{disabled}
							oninput={(event) => (query = event.currentTarget.value)}
							onkeydown={handleKeydown}
						/>
					</form>
					<button
						class="close-button"
						type="button"
						aria-label="Close search"
						onclick={() => closeSearch({ restoreFocus: true })}
					>
						<IconCancel />
					</button>
				</div>
			{/if}

			<div class="results" aria-live="polite" data-testid="entity-search-results">
				{#if loading}
					<div class="search-loading" role="status"><Spinner size="20" /><span>Searching…</span></div>
				{:else if errorMessage}
					<p>{errorMessage}</p>
				{:else if hasQuery && results.length}
					<p class="result-count">
						{results.length} suggestion{results.length === 1 ? '' : 's'}
					</p>
					<ul id={listboxId} role="listbox" aria-label="Search suggestions">
						{#each results as result, index (result.id)}
							{@const address = formatVaultAddressPrefix(result.address)}
							<li class:has-action={Boolean(addButton)}>
								<a
									id={`${listboxId}-${index}`}
									class:active={selectedIndex === index}
									class:no-logo={!result.logoUrl}
									data-entity-type={result.entityType}
									href={resolve(result.href as `/vaults/${string}`)}
									role="option"
									aria-selected={selectedIndex === index}
									class="result-link"
									onpointerdown={(event) => event.preventDefault()}
									onclick={(event) => handleResultClick(event, index)}
								>
									<span class="logo-slot"
										>{#if result.logoUrl}<img src={result.logoUrl} alt="" use:removeOnError />{/if}</span
									>
									<span class="result-main">
										<strong class:blacklisted={result.entityType === 'blacklisted-vault'}>{result.name}</strong>
										<span class="type">
											<span class="entity-type" style:--entity-colour={searchEntityColours[result.entityType]}>
												<span class="entity-type-marker" aria-hidden="true"></span>
												{searchEntityLabels[result.entityType]}
											</span>
											{#if result.protocolName && result.chainName}
												<span class="vault-context" title={`${result.protocolName} · ${result.chainName}`}>
													<span>{result.protocolName}</span>
													<span aria-hidden="true">·</span>
													<span>{result.chainName}</span>
												</span>
											{/if}
											{#if address}<span>· {address}</span>{/if}
										</span>
									</span>
									<span class="result-sparkline">
										{#if result.vaultId}
											<VaultSparkline vault={{ id: result.vaultId, name: result.name }} hideUnavailable />
										{/if}
									</span>
									<span class="metrics"
										><span aria-label="1 month APY">{formatApy(result.averageApy1m)}</span><span aria-label="Latest TVL"
											>{formatTvl(result.latestTvl)}</span
										></span
									>
								</a>
								{#if addButton}
									<span class="result-action">{@render addButton(result, clearActionSearch)}</span>
								{/if}
							</li>
						{/each}
					</ul>
				{:else if hasQuery}
					<p>No results found. Try another name or symbol.</p>
				{:else}
					<p>Search vaults, curators, protocols, stablecoins and chains.</p>
				{/if}
			</div>

			{#if hasQuery && showAllResults}
				<a
					class="show-all"
					href={resolve(`/search?q=${encodeURIComponent(query.trim())}` as '/search')}
					onclick={closeSearchForNavigation}>Show all results</a
				>
			{/if}
		</div>
	{/if}
</div>

<style>
	.search {
		position: relative;
		width: 100%;
	}
	.search-label {
		display: block;
		margin-bottom: var(--space-xs);
		color: var(--c-text-light);
		font: var(--f-ui-sm-medium);
	}
	.page-search .search-label {
		font: var(--f-heading-xs-medium);
		font-size: 1rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	.desktop-search input,
	.mobile-search-row input {
		box-sizing: border-box;
		width: 100%;
		height: 2.625rem;
		padding: 0 var(--space-md) 0 2.25rem;
		border: 1px solid var(--c-input-border);
		border-radius: var(--radius-sm);
		background: var(--c-input-background);
		color: var(--c-text);
		font: var(--f-ui-md-medium);
	}
	.desktop-search {
		position: relative;
	}
	.desktop-search::before {
		content: '';
		position: absolute;
		z-index: 1;
		top: 50%;
		left: 0.75rem;
		width: 1rem;
		height: 1rem;
		transform: translateY(-50%);
		background: currentColor;
		mask: url('data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"%3E%3Cpath d="m21 21-4.35-4.35M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" fill="none" stroke="black" stroke-width="2"/%3E%3C/svg%3E')
			center / contain no-repeat;
		opacity: 0.65;
	}
	.search-trigger {
		display: none;
		border: 0;
		background: transparent;
		color: var(--c-text);
		cursor: pointer;
	}
	.dialog {
		position: absolute;
		z-index: 1000;
		top: calc(100% + var(--space-xs));
		right: 0;
		width: min(46rem, calc(100vw - var(--space-md) * 2));
		border: 1px solid var(--c-box-3);
		border-radius: var(--radius-md);
		background: var(--c-body);
		box-shadow: var(--shadow-3);
		padding: var(--space-md);
	}
	.page-search .dialog {
		left: 0;
		box-sizing: border-box;
		width: 100%;
	}
	.mobile-search-row {
		display: none;
	}
	.results {
		max-height: min(26rem, calc(100dvh - var(--header-height) - var(--space-xl)));
		overflow: auto;
	}
	.results p {
		margin: var(--space-md) 0;
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-medium);
	}
	.result-count {
		margin-bottom: var(--space-xs) !important;
	}
	ul {
		display: grid;
		gap: var(--space-xxs);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li.has-action {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: var(--space-xs);
	}
	.result-link {
		display: grid;
		grid-template-columns: 2rem minmax(0, 1fr) auto;
		gap: var(--space-sm);
		align-items: center;
		padding: var(--space-sm);
		border-radius: var(--radius-sm);
		color: inherit;
		text-decoration: none;
	}
	.result-link:is(.no-logo, :has(.logo-slot:not(:has(img)))) {
		grid-template-columns: minmax(0, 1fr) auto;
	}
	.result-link:is(.no-logo, :has(.logo-slot:not(:has(img)))) .logo-slot {
		display: none;
	}
	.result-link:is(:hover, :focus-visible, .active) {
		outline: none;
		background: var(--background-hover);
	}
	.result-action {
		padding-right: var(--space-sm);

		:global(button) {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: var(--space-xs);
			min-width: 4rem;
			min-height: 2.25rem;
			padding: 0 var(--space-sm);
			border: 1px solid var(--c-input-border);
			border-radius: var(--radius-sm);
			background: var(--c-input-background);
			color: var(--c-link);
			font: var(--f-ui-sm-medium);
			cursor: pointer;
		}

		:global(button:is(:hover, :focus-visible)) {
			border-color: var(--c-input-border-focus);
			outline: none;
			background: var(--background-hover);
		}

		:global(button:disabled) {
			color: var(--c-text-extra-light);
			cursor: default;
			opacity: 0.6;
		}
	}
	.search-loading {
		display: flex;
		align-items: center;
		gap: var(--space-sm);
		min-height: 4rem;
		padding-inline: var(--space-sm);
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-medium);
	}
	.logo-slot {
		display: grid;
		width: 2rem;
		height: 2rem;
		place-items: center;
		border-radius: 50%;
		background: var(--c-box-2);
		overflow: hidden;
	}
	.logo-slot img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	.result-main {
		display: grid;
		min-width: 0;
		gap: 0.125rem;
		container-type: inline-size;
	}
	.result-main strong {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.result-main strong.blacklisted {
		color: var(--c-text-extra-light);
		text-decoration: line-through;
	}
	.type {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		min-width: 0;
		overflow: hidden;
		color: var(--c-text-extra-light);
		font: var(--f-ui-xs-medium);
		text-transform: capitalize;
		white-space: nowrap;
	}
	.entity-type {
		display: inline-flex;
		flex: 0 0 auto;
		align-items: center;
		gap: 0.35rem;
		color: var(--entity-colour);
	}
	.entity-type-marker {
		flex: 0 0 auto;
		width: 0.5rem;
		height: 0.5rem;
		border-radius: 0.125rem;
		background: currentColor;
	}
	.vault-context {
		display: none;
		min-width: 0;
		overflow: hidden;
	}
	.vault-context span:not([aria-hidden]) {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.result-sparkline {
		justify-items: end;
		color: var(--c-text-extra-light);
	}
	.result-sparkline :global(.vault-sparkline) {
		--sparkline-width: 6rem;
	}
	.metrics {
		display: grid;
		justify-items: end;
		gap: 0.125rem;
		color: var(--c-text-extra-light);
		font: var(--f-ui-xs-medium);
		white-space: nowrap;
	}
	.result-sparkline {
		display: none;
	}
	.show-all {
		display: block;
		margin-top: var(--space-md);
		color: var(--c-link);
		font: var(--f-ui-sm-medium);
		text-align: center;
	}

	@media (--viewport-sm-down) {
		.page-search .search-label {
			font-size: 0.875rem;
		}
	}

	@media (--nav-collapsed) {
		.desktop-search {
			display: none;
		}
		.search-trigger {
			display: grid;
			width: 2.5rem;
			height: 2.5rem;
			place-items: center;
			padding: 0;
		}
		.menu-search .search-trigger {
			display: flex;
			width: 100%;
			height: 3rem;
			justify-content: flex-start;
			gap: var(--space-sm);
			padding: 0 var(--space-md);
			border: 1px solid var(--c-input-border);
			border-radius: var(--radius-sm);
			background: var(--c-input-background);
			font: var(--f-ui-md-medium);
		}
		.search-trigger:focus-visible,
		.close-button:focus-visible {
			outline: 2px solid var(--c-input-border-focus);
			outline-offset: 2px;
		}
		.dialog {
			position: fixed;
			inset: 0;
			box-sizing: border-box;
			display: grid;
			grid-template-rows: auto minmax(0, 1fr) auto;
			width: auto;
			height: 100dvh;
			border: 0;
			border-radius: 0;
			padding: max(var(--space-md), env(safe-area-inset-top)) max(var(--space-md), env(safe-area-inset-right))
				max(var(--space-md), env(safe-area-inset-bottom)) max(var(--space-md), env(safe-area-inset-left));
		}
		.mobile-search-row {
			display: grid;
			grid-template-columns: minmax(0, 1fr) auto;
			gap: var(--space-sm);
			align-items: center;
		}
		.close-button {
			display: grid;
			width: 2.625rem;
			height: 2.625rem;
			place-items: center;
			border: 0;
			border-radius: var(--radius-sm);
			background: var(--c-box-2);
			color: var(--c-text);
			cursor: pointer;
		}
		.results {
			max-height: none;
			margin-top: var(--space-md);
		}
		.results ul {
			max-width: 31.25rem;
			margin-inline: auto;
		}
		.page-search .desktop-search {
			display: block;
		}
		.page-search .search-trigger,
		.page-search .mobile-search-row {
			display: none;
		}
		.page-search .dialog {
			position: absolute;
			inset: auto 0 auto 0;
			top: calc(100% + var(--space-xs));
			display: block;
			box-sizing: border-box;
			width: 100%;
			height: auto;
			padding: var(--space-md);
			border: 1px solid var(--c-box-3);
			border-radius: var(--radius-md);
			box-shadow: var(--shadow-3);
		}
		.page-search .results {
			max-height: min(26rem, calc(100dvh - var(--header-height) - var(--space-xl)));
			margin-top: 0;
		}
		.page-search .results ul {
			max-width: none;
		}
	}

	@media (--nav-collapsed) and (--viewport-sm-up) {
		/* Tablet uses the same persistent input as desktop: no trigger-to-dialog swap. */
		.menu-search .desktop-search {
			display: block;
		}
		.menu-search .search-trigger {
			display: none;
		}
		.menu-search .dialog {
			position: static;
			width: 100%;
			height: auto;
			max-height: none;
			padding: 0;
			border: 0;
			box-shadow: none;
		}
		.mobile-search-row {
			display: none;
		}
		.dialog .result-link {
			grid-template-columns: 2rem minmax(0, 1fr) 6rem auto;
		}
		.dialog .result-sparkline {
			display: grid;
			justify-content: end;
		}
	}

	@media (--viewport-xs) {
		.dialog .result-link {
			grid-template-columns: 2rem minmax(0, 1fr) max-content;
			grid-template-areas:
				'logo main metrics'
				'. . sparkline';
			align-items: start;
			row-gap: var(--space-xs);
		}
		.dialog .result-link:is(.no-logo, :has(.logo-slot:not(:has(img)))) {
			grid-template-columns: minmax(0, 1fr) max-content;
			grid-template-areas:
				'main metrics'
				'. sparkline';
		}
		.dialog .logo-slot {
			grid-area: logo;
		}
		.dialog .result-main {
			grid-area: main;
		}
		.dialog .result-sparkline {
			grid-area: sparkline;
			display: flex;
			justify-content: end;
		}
		.dialog .metrics {
			grid-area: metrics;
		}
	}

	@media (--nav-expanded) {
		@container (min-width: 18rem) {
			.vault-context {
				display: inline-flex;
				align-items: center;
				gap: 0.35rem;
			}
		}
		.result-sparkline {
			display: block;
			width: 7rem;

			:global(.vault-sparkline) {
				--sparkline-width: 7rem;
			}
		}
		.result-link {
			grid-template-columns: 2rem minmax(0, 1fr) 7rem auto;
		}
	}
</style>
