<script lang="ts">
	import { page } from '$app/state';

	interface Props {
		boxed?: boolean;
	}

	let { boxed = false }: Props = $props();

	const links = [
		{ href: '/trading-view/vaults', label: 'Top' },
		{ href: '/trading-view/vaults/high-tvl', label: 'Top with $2M TVL' },
		{ href: '/trading-view/vaults/new-vaults', label: 'New' },
		{ href: '/trading-view/vaults/stablecoins', label: 'By stablecoin' },
		{ href: '/trading-view/vaults/chains', label: 'By chain' },
		{ href: '/trading-view/vaults/protocols', label: 'By protocol' }
	];

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

<nav class="vault-listings-selector" class:boxed>
	<span class="label">All vaults by:</span>
	{#each links as link, i}
		{#if i > 0}
			<span class="separator">|</span>
		{/if}
		<a href={link.href} class:active={isActive(link.href)}>
			{link.label}
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

	.separator {
		color: var(--c-text-ultra-light);
	}

	a {
		color: var(--c-text-extra-light);
		text-decoration: none;
		transition: color var(--time-sm);

		&:hover {
			color: var(--c-text);
		}

		&.active {
			color: var(--c-text);
			font-weight: 700;
		}
	}

	.boxed {
		padding: 0 var(--space-xl);

		@media (--viewport-md-down) {
			padding: var(--space-sm) var(--space-lg);
		}
	}
</style>
