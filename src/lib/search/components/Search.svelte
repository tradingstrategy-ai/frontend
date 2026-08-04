<!--
@component
Site-wide vault search with desktop typeahead and a full-screen compact-navigation dialog.

The component fetches only public search suggestions; the server keeps the
underlying vault JSON index private.
-->
<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
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
	import VaultSparkline from '$lib/top-vaults/VaultSparkline.svelte';

	interface Props {
		menu?: boolean;
		onNavigate?: () => void;
	}

	let { menu = false, onNavigate }: Props = $props();

	const listboxId = 'site-search-suggestions';
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
	let mobileSearchInput = $state<HTMLInputElement>();
	let searchTrigger = $state<HTMLButtonElement>();
	let searchRoot: HTMLDivElement;

	let hasQuery = $derived(query.trim().length > 0);
	let activeOptionId = $derived(selectedIndex >= 0 ? `${listboxId}-${selectedIndex}` : undefined);

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

		const controller = new AbortController();
		const timeout = setTimeout(async () => {
			loading = true;
			try {
				const response = await fetch(
					`/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=${TYPEAHEAD_LIMIT}`,
					{
						signal: controller.signal
					}
				);
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

	/** Close the quick-search UI before navigating to a search or entity page. */
	function closeSearchForNavigation() {
		closeSearch();
		onNavigate?.();
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
			goto(results[selectedIndex].href);
			closeSearchForNavigation();
		}
	}

	function handleSubmit(event: SubmitEvent) {
		if (selectedIndex >= 0) {
			event.preventDefault();
			goto(results[selectedIndex].href);
		}
		closeSearchForNavigation();
	}
</script>

<svelte:body use:disableScroll={mobileDialogOpen} />

<div
	bind:this={searchRoot}
	class="search"
	class:menu-search={menu}
	data-testid={menu ? 'mobile-menu-search' : 'nav-search'}
>
	<form class="desktop-search" action="/search" role="search" onsubmit={handleSubmit}>
		<input
			bind:value={query}
			aria-activedescendant={activeOptionId}
			aria-autocomplete="list"
			aria-controls={listboxId}
			aria-expanded={open}
			aria-label="Search vaults and DeFi entities"
			role="combobox"
			name="q"
			type="search"
			placeholder="Search vaults"
			autocomplete="off"
			autocapitalize="none"
			spellcheck="false"
			onfocus={() => {
				mobileDialogOpen = false;
				open = true;
			}}
			oninput={() => {
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

	{#if open}
		<div class="dialog" role="dialog" aria-modal="true" aria-label="Search">
			<div class="mobile-search-row">
				<form action="/search" role="search" onsubmit={handleSubmit}>
					<input
						bind:this={mobileSearchInput}
						bind:value={query}
						aria-activedescendant={activeOptionId}
						aria-autocomplete="list"
						aria-controls={listboxId}
						aria-expanded={open}
						aria-label="Search vaults and DeFi entities"
						role="combobox"
						name="q"
						type="search"
						placeholder="Search vaults, curators, protocols and chains"
						autocomplete="off"
						autocapitalize="none"
						spellcheck="false"
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

			<div class="results" aria-live="polite" data-testid="entity-search-results">
				{#if loading}
					<p>Searching…</p>
				{:else if errorMessage}
					<p>{errorMessage}</p>
				{:else if hasQuery && results.length}
					<p class="result-count">{results.length} suggestion{results.length === 1 ? '' : 's'}</p>
					<ul id={listboxId} role="listbox" aria-label="Search suggestions">
						{#each results as result, index (result.id)}
							{@const address = formatVaultAddressPrefix(result.address)}
							<li>
								<a
									id={`${listboxId}-${index}`}
									class:active={selectedIndex === index}
									class:no-logo={!result.logoUrl}
									data-entity-type={result.entityType}
									href={result.href}
									role="option"
									aria-selected={selectedIndex === index}
									onpointerdown={(event) => event.preventDefault()}
									onclick={closeSearchForNavigation}
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
							</li>
						{/each}
					</ul>
				{:else if hasQuery}
					<p>No results found. Try another name or symbol.</p>
				{:else}
					<p>Search vaults, curators, protocols, stablecoins and chains.</p>
				{/if}
			</div>

			{#if hasQuery}
				<a class="show-all" href={`/search?q=${encodeURIComponent(query.trim())}`} onclick={closeSearchForNavigation}
					>Show all results</a
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
	li a {
		display: grid;
		grid-template-columns: 2rem minmax(0, 1fr) auto;
		gap: var(--space-sm);
		align-items: center;
		padding: var(--space-sm);
		border-radius: var(--radius-sm);
		color: inherit;
		text-decoration: none;
	}
	li a:is(.no-logo, :has(.logo-slot:not(:has(img)))) {
		grid-template-columns: minmax(0, 1fr) auto;
	}
	li a:is(.no-logo, :has(.logo-slot:not(:has(img)))) .logo-slot {
		display: none;
	}
	li a:is(:hover, :focus-visible, .active) {
		outline: none;
		background: var(--background-hover);
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
		color: var(--c-text-extra-light);
		font: var(--f-ui-xs-medium);
		text-transform: capitalize;
	}
	.entity-type {
		display: inline-flex;
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
	}

	@media (--nav-collapsed) and (--viewport-sm-up) {
		.menu-search:has(.dialog) .search-trigger {
			display: none;
		}
		.menu-search .dialog {
			position: absolute;
			inset: 0 auto auto 0;
			width: 100%;
			height: auto;
			max-height: calc(100dvh - var(--header-height) - var(--space-lg));
			padding: 0;
		}
		.mobile-search-row {
			position: relative;
			width: 31.25rem;
			grid-template-columns: minmax(0, 1fr);
			gap: 0;
			margin-inline: auto;
		}
		.close-button {
			position: absolute;
			top: 0;
			bottom: 0;
			left: calc(100% + var(--space-md));
		}
		.dialog li a {
			grid-template-columns: 2rem minmax(0, 1fr) 6rem auto;
		}
		.dialog .result-sparkline {
			display: grid;
			justify-content: end;
		}
	}

	@media (--viewport-xs) {
		.dialog li a {
			grid-template-columns: 2rem minmax(0, 1fr) max-content;
			grid-template-areas:
				'logo main metrics'
				'. . sparkline';
			align-items: start;
			row-gap: var(--space-xs);
		}
		.dialog li a:is(.no-logo, :has(.logo-slot:not(:has(img)))) {
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
		.result-sparkline {
			display: block;
			width: 7rem;

			:global(.vault-sparkline) {
				--sparkline-width: 7rem;
			}
		}
		li a {
			grid-template-columns: 2rem minmax(0, 1fr) 7rem auto;
		}
	}
</style>
