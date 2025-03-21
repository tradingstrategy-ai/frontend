<script lang="ts">
	import Section from '$lib/components/Section.svelte';
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
		<div class="number-tiles">
			<a class="tile b" href="/trading-view/trading-pairs" data-sveltekit-preload-data>
				<strong>{formatAmount(impressiveNumbers.pairs)}</strong>
				<span>trading pairs</span>
			</a>

			<a class="tile b" href="/trading-view/trading-pairs" data-sveltekit-preload-data>
				<strong>{formatDollar(impressiveNumbers.liquidity)}</strong>
				<span>liquidity</span>
			</a>

			<a class="tile b" href="/trading-view/exchanges" data-sveltekit-preload-data>
				<strong>{formatAmount(impressiveNumbers.exchanges)}</strong>
				<span>decentralised exchanges</span>
			</a>
		</div>

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
		display: grid;
		grid-template-columns: repeat(8, auto);
		justify-content: space-evenly;
		margin-block: 1rem;
		--size: clamp(3.5rem, 8vw, 6rem);

		@media (--viewport-md-down) {
			grid-template-columns: repeat(4, auto);
			justify-content: center;
			gap: clamp(1.5rem, 4.5vw, 5rem);
		}

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

	.number-tiles {
		display: grid;
		gap: 1.5rem;

		@media (--viewport-lg-up) {
			grid-template-columns: repeat(3, 1fr);
		}

		a {
			display: grid;
			gap: 0.125rem;
			padding: 1rem;
			place-content: center;
			text-align: center;
			min-height: 12rem;

			strong {
				font: var(--f-heading-xl-bold);
			}

			span {
				color: var(--c-text-extra-light);
				font: var(--f-ui-xl-medium);
			}
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
