<!--
	Render listing of all available Pairs for specific chain
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
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

<MetaTags
	titleParts={[`${chain.name} trading pairs`, 'DEX market data']}
	description={`Top decentralised exchange trading pairs on ${chain.name} ranked by volume and liquidity, with price charts and OHLCV history.`}
	image={`/social-card/blockchain/${chain.slug}`}
/>

<Breadcrumbs labels={{ [chain.slug]: chain.name, 'trading-pairs': 'Trading pairs' }} />

<main class="pair-index-page">
	<Section tag="header">
		<HeroBanner title="{chain.name} trading pairs">
			{#snippet subtitle()}
				Browse {formatAmount(pairs?.totalRowCount)} trading pairs on
				<a class="body-link" href={resolve('/trading-view/[chain=slug]', { chain: chain.slug })}
					>{chain.name} blockchain</a
				>.
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="sm">
		<PairTable {...pairs} {...options} {loading} hideChainIcon {onChange} />
	</Section>
</main>
