<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import TokenTable from '$lib/explorer/TokenTable.svelte';
	import { HeroBanner, Section } from '$lib/components';
	import { formatAmount } from '$lib/helpers/formatters.js';

	export let data;
	$: ({ chain, tokens } = data);

	let loading = false;

	async function handleChange({ detail }: ComponentEvents<TokenTable>['change']) {
		loading = true;
		await goto('?' + new URLSearchParams(detail.params), { noScroll: true });
		loading = false;
		detail.scrollToTop();
	}
</script>

<svelte:head>
	<title>{chain.chain_name} Tokens | Trading Strategy</title>
	<meta name="description" content="Top tokens on {chain.chain_name} blockchain" />
</svelte:head>

<Breadcrumbs labels={{ [chain.chain_slug]: chain.chain_name }} />

<main class="token-index-page">
	<Section tag="header">
		<HeroBanner contentFullWidth title="{chain.chain_name} tokens">
			<svelte:fragment slot="subtitle">
				Browse {formatAmount(tokens.totalRowCount)} tokens on
				<a class="body-link" href=".">{chain.chain_name} blockchain</a>.
			</svelte:fragment>
		</HeroBanner>
	</Section>

	<Section padding="sm">
		<TokenTable {...tokens} {loading} on:change={handleChange} />
	</Section>
</main>
