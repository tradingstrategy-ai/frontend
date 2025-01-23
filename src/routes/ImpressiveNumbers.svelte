<script lang="ts">
	import Section from '$lib/components/Section.svelte';
	import Grid from '$lib/components/Grid.svelte';
	import UspTile from '$lib/components/UspTile.svelte';
	import { formatAmount, formatDollar } from '$lib/helpers/formatters';

	let { impressiveNumbers } = $props();
</script>

{#if impressiveNumbers}
	<Section gap="md" padding="md" testId="impressive-numbers" --section-background="var(--c-background-accent-1)">
		<h2 style="text-align: center;">Your strategy can trade</h2>
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
	</Section>
{/if}

<style>
	h2 {
		text-align: center;
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
