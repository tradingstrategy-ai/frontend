<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Grid from '$lib/components/Grid.svelte';
	import UspTile from '$lib/components/UspTile.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { formatAmount, formatDollar } from '$lib/helpers/formatters';

	let { chains, impressiveNumbers } = $props();
</script>

<Section gap="md" padding="lg" testId="impressive-numbers" --section-background="var(--c-background-accent-1)">
	{#if chains}
		<h2>Trading Strategy runs on</h2>
		<div class="chains">
			{#each chains as chain}
				<a class="tile b" title={chain.chain_name} href="/trading-view/{chain.chain_slug}" data-sveltekit-preload-data>
					<img src={getLogoUrl('blockchain', chain.chain_slug)} alt={chain.chain_name} />
				</a>
			{/each}
		</div>
	{/if}

	{#if impressiveNumbers}
		<h2>Your strategy can trade</h2>
		<Grid cols={3} gap="lg">
			<UspTile
				title={formatAmount(impressiveNumbers.pairs)}
				subtitle="trading pairs"
				href="/trading-view/trading-pairs"
			/>
			<UspTile
				title={formatDollar(impressiveNumbers.liquidity)}
				subtitle="liquidity"
				href="/trading-view/trading-pairs"
			/>
			<UspTile title={impressiveNumbers.blockchains} subtitle="blockchains" href="/trading-view/blockchains" />
		</Grid>

		<p class="benefits">
			Decentralised finance offers significant new opportunities for algorithmic traders.
			<a class="body-link" rel="external" href="https://tradingstrategy.ai/about">
				Contact us to learn how to port your algorithms.
			</a>
		</p>
	{/if}
</Section>

<style>
	h2 {
		text-align: center;
	}

	.chains {
		display: flex;
		justify-content: center;
		gap: clamp(1rem, 4.5vw, 5rem);
		margin-block: 1rem;
		--size: clamp(2.5rem, 8vw, 6rem);

		@media (--viewport-sm-down) {
			margin-block: 0.5rem;
		}

		a {
			border-radius: 50%;
			width: var(--size);
			height: var(--size);
			padding: calc(var(--size) * 0.2);
		}
	}

	p {
		font: var(--f-ui-xl-roman);
		letter-spacing: var(--f-ui-xl-spacing, normal);
	}

	.benefits {
		text-align: center;
		max-width: 48ch;
		margin: 0 auto;
	}
</style>
