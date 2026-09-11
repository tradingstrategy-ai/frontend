<!--
@component
Shows the source-supplied description and aggregate metrics for one vault strategy category.
-->
<script lang="ts">
	import type { VaultCategory } from '$lib/top-vaults/schemas';
	import Markdown from '$lib/components/Markdown.svelte';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters';

	interface Props {
		category: VaultCategory;
	}

	let { category }: Props = $props();
</script>

<MetricsBox class="category-description" title={`About ${category.label}`}>
	<Markdown content={category.description} />
	<p class="category-stats">
		Reported strategy totals: <strong>{category.vault_count}</strong>
		{category.vault_count === 1 ? 'vault' : 'vaults'},
		<strong>{formatDollar(category.tvl_usd, 1)} TVL</strong>{#if category.one_month_apy != null}, and
			<strong>{formatPercent(category.one_month_apy, 1)} 30-day average APY</strong>{/if}.
	</p>
</MetricsBox>

<style>
	:global(.category-description) {
		color: var(--c-text-extra-light);

		:global(.markdown :is(p, li)) {
			font: var(--f-ui-md-roman);
		}
	}

	.category-stats {
		margin: 1rem 0 0;
		font: var(--f-ui-md-roman);

		strong {
			color: var(--c-text);
			font-weight: 600;
		}
	}
</style>
