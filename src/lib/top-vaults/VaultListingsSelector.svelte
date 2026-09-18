<!--
@component
Renders navigation links for vault listing and chart pages.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import DropdownMenu from '$lib/components/DropdownMenu.svelte';
	import { vaultChartLinks } from './vault-chart-links';

	const links = [
		{ href: '/vaults', label: 'Top' },
		{ href: '/vaults/stablecoins', label: 'Stablecoins' },
		{ href: '/vaults/chains', label: 'Chains' },
		{ href: '/vaults/strategies', label: 'Strategies' },
		{ href: '/vaults/protocols', label: 'Protocols' },
		{ href: '/vaults/curators', label: 'Curators' },
		{ href: '/vaults/international', label: 'International' },
		{ href: '/vaults/funds', label: 'Tokenised funds' }
	] as const;

	const otherListLinks = [
		{ href: '/vaults/high-tvl', label: 'Top with $2M TVL' },
		{ href: '/vaults/new-vaults', label: 'New' },
		{ href: '/vaults/negative', label: 'Negative' },
		{ href: '/vaults/whitelisted', label: 'Whitelisted' },
		{ href: '/vaults/blacklisted', label: 'Blacklisted' },
		{ href: '/vaults/all', label: 'All' },
		{ href: '/vaults/core3-ratings', label: 'CORE3 ratings' },
		{ href: '/vaults/xerberus-ratings', label: 'Xerberus ratings' }
	] as const;

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}

	function resolveDropdownHref(href: string): string {
		return (resolve as (path: string) => string)(href);
	}
</script>

<nav class="vault-listings-selector ds-3">
	<span class="label">Vaults by:</span>
	{#each links as { href, label } (href)}
		<a href={resolve(href)} class:active={isActive(href)}>
			{label}
		</a>
	{/each}
	<DropdownMenu
		label="Charts"
		items={vaultChartLinks}
		{isActive}
		resolveHref={resolveDropdownHref}
		class="nav-dropdown"
	/>
	<DropdownMenu label="More" items={otherListLinks} {isActive} resolveHref={resolveDropdownHref} class="nav-dropdown" />
</nav>

<style>
	.vault-listings-selector {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5em;
		position: relative;
		z-index: 20;
		isolation: isolate;
		font: var(--f-ui-md-medium);
		color: var(--c-text-extra-light);
	}

	.label {
		color: var(--c-text-light);
	}

	a {
		color: var(--c-text-extra-light);
		text-decoration: none;
		transition: color var(--time-sm);

		&:not(:first-of-type)::before {
			content: '|';
			color: var(--c-text-ultra-light);
			padding-right: 0.5rem;
		}

		&:hover {
			color: var(--c-text);
		}

		&.active {
			color: var(--c-text);
			font-weight: 700;
		}
	}

	:global(.nav-dropdown)::before {
		content: '|';
		color: var(--c-text-ultra-light);
		padding-right: 0.5rem;
	}

	:global(.nav-dropdown) {
		--dropdown-menu-open-z-index: 200;
		--dropdown-menu-panel-z-index: 2400;
	}
</style>
