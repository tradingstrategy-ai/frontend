<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import TokenTable from '$lib/explorer/TokenTable.svelte';
	import { HeroBanner, Section } from '$lib/components';
	import { formatAmount } from '$lib/helpers/formatters';

	let { data } = $props();
	let { chain, tokens } = $derived(data);

	let loading = $state(false);

	const onChange: ComponentProps<typeof TokenTable>['onChange'] = async (params, scrollToTop) => {
		loading = true;
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		loading = false;
		scrollToTop();
	};
</script>

<svelte:head>
	<title>{chain.name} Tokens | Trading Strategy</title>
	<meta name="description" content="Top tokens on {chain.name} blockchain" />
</svelte:head>

<Breadcrumbs labels={{ [chain.slug]: chain.name }} />

<main class="token-index-page">
	<Section tag="header">
		<HeroBanner title="{chain.name} tokens">
			{#snippet subtitle()}
				Browse {formatAmount(tokens.totalRowCount)} tokens on
				<a class="body-link" href=".">{chain.name} blockchain</a>.
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="sm">
		<TokenTable {...tokens} {loading} {onChange} />
	</Section>
</main>
