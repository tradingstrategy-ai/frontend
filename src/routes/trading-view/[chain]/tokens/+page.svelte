<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import TokenTable from '$lib/explorer/TokenTable.svelte';
	import { HeroBanner, Section } from '$lib/components';

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
	<title>Tokens on {chain.chain_name}</title>
	<meta name="description" content="Top tokens on {chain.chain_name} blockchain" />
</svelte:head>

<Breadcrumbs labels={{ [chain.chain_slug]: chain.chain_name }} />

<main class="token-index-page">
	<Section tag="header">
		<HeroBanner contentFullWidth title="Tokens">
			<svelte:fragment slot="subtitle">
				Browse supported decentralised tokens across
				<a class="body-link" href="/trading-view/{chain.chain_slug}">{chain.chain_name} blockchain</a>
			</svelte:fragment>
		</HeroBanner>
	</Section>

	<Section padding="sm">
		<TokenTable {...tokens} {loading} on:change={handleChange} />
	</Section>
</main>
