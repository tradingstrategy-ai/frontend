<!--
	Render listing of all available Pairs for specific chain
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PairTable from '$lib/explorer/PairTable.svelte';
	import { HeroBanner, Section } from '$lib/components';
	import { formatAmount } from '$lib/helpers/formatters';

	let { data } = $props();
	let { chain, pairs, options } = $derived(data);

	let loading = $state(false);

	const onChange: ComponentProps<typeof PairTable>['onChange'] = async (params, scrollToTop) => {
		loading = true;
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		loading = false;
		scrollToTop();
	};
</script>

<svelte:head>
	<title>{chain.chain_name} Trading Pairs | Trading Strategy</title>
	<meta name="description" content="Top trading pairs on {chain.chain_name} blockchain" />
</svelte:head>

<Breadcrumbs labels={{ [chain.chain_slug]: chain.chain_name, 'trading-pairs': 'Trading pairs' }} />

<main class="pair-index-page">
	<Section tag="header">
		<HeroBanner title="{chain.chain_name} trading pairs">
			{#snippet subtitle()}
				Browse {formatAmount(pairs.totalRowCount)} trading pairs on
				<a class="body-link" href=".">{chain.chain_name} blockchain</a>.
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="sm">
		<PairTable {...pairs} {...options} {loading} hideChainIcon {onChange} />
	</Section>
</main>
