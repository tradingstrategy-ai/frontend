<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	const links = [
		{ href: '/trading-view/vaults', label: 'Top' },
		{ href: '/trading-view/vaults/high-tvl', label: 'Top with $2M TVL' },
		{ href: '/trading-view/vaults/new-vaults', label: 'New' },
		{ href: '/trading-view/vaults/stablecoins', label: 'By stablecoin' },
		{ href: '/trading-view/vaults/chains', label: 'By chain' },
		{ href: '/trading-view/vaults/protocols', label: 'By protocol' },
		{ href: '/trading-view/vaults/all', label: 'All' },
		{ href: '/trading-view/vaults/yield-risk', label: 'Yield / Risk' },
		{ href: '/trading-view/vaults/yield-protocol', label: 'Yield / Protocol' },
		{ href: '/trading-view/vaults/yield-chain', label: 'Yield / Chain' }
	] as const;

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<nav class="vault-listings-selector ds-3">
	<span class="label">Vaults by:</span>
	{#each links as { href, label } (href)}
		<a href={resolve(href)} class:active={isActive(href)}>
			{label}
		</a>
	{/each}
</nav>

<style>
	.vault-listings-selector {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5em;
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
</style>
