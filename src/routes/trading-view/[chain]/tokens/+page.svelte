<script lang="ts">
	import type { PageData } from './$types';
	import type { ComponentEvents } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import TokenTable from '$lib/explorer/TokenTable.svelte';
	import { HeroBanner, Section } from '$lib/components';

	export let data: PageData;

	const chainSlug = $page.params.chain;
	const chainName = chainSlug[0].toUpperCase() + chainSlug.slice(1);

	let loading = false;

	async function handleChange({ detail }: ComponentEvents<TokenTable>['change']) {
		loading = true;
		await goto('?' + new URLSearchParams(detail.params), { noScroll: true });
		loading = false;
		detail.scrollToTop();
	}
</script>

<svelte:head>
	<title>Tokens on {chainName}</title>
	<meta name="description" content="Top tokens on {chainName} blockchain" />
</svelte:head>

<Breadcrumbs />

<main>
	<Section>
		<HeroBanner contentFullWidth title="Tokens">
			<svelte:fragment slot="subtitle">
				Browse supported decentralised tokens across
				<a class="body-link" href="/trading-view/{chainSlug}">{chainName} blockchain</a>
			</svelte:fragment>
		</HeroBanner>
	</Section>

	<Section padding="sm">
		<TokenTable {...data} {loading} on:change={handleChange} />
	</Section>
</main>

<style lang="postcss">
	main {
		display: grid;
		gap: var(--space-md);
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
