<script lang="ts">
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import TokenIndexExplorer from '$lib/explorer/TokenIndexExplorer.svelte';

	const chainSlug = $page.params.chain;
	const chainName = chainSlug[0].toUpperCase() + chainSlug.slice(1);
</script>

<svelte:head>
	<title>Tokens on {chainName}</title>
	<meta name="description" content="Top tokens on {chainName} blockchain" />
</svelte:head>

<Breadcrumbs />

<main>
	<header class="ds-container">
		<h1>Tokens</h1>
		<p>
			Browse supported decentralised tokens across
			<a href="/trading-view/blockchains">{chainName} blockchain</a>
		</p>
	</header>

	<section class="ds-container">
		<TokenIndexExplorer
			enabledColumns={['name', 'symbol', 'liquidity_latest', 'volume_24h']}
			orderColumnIndex={2}
			{chainSlug}
		/>
	</section>
</main>

<style lang="postcss">
	main {
		display: grid;
		gap: 1rem;
	}

	header {
		gap: 0.75rem;

		& p {
			font: var(--f-h4-roman);

			& a {
				text-decoration: underline;
				font-weight: 700;
			}

			@media (--viewport-lg-up) {
				font: var(--f-h3-roman);
			}
		}
	}

	section :global {
		& .col-exchange {
			padding-left: 0;
		}

		& .col-volume {
			width: 10%;
		}

		& .col-chain-name {
			width: 25%;
		}
	}
</style>
