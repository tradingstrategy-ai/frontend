<script context="module" lang="typescript">
	import { browser, dev } from '$app/env';

	export const hydrate = dev;
	export const router = browser;

	interface ApiError {
		status: number,
		message: string
	}

	// https://gist.github.com/acoyfellow/a94f020245d4bfcd4c5d9ddc8f86a98a
	export async function load({ page, session, fetch, context }) {
		const url = `https://matilda.tradingstrategy.ai/exchanges`;
		const res = await fetch(url);

		
		if (res.ok) {
			const exchanges = await res.json();
			return {
				props: {
					exchanges: exchanges.exchanges,
					apiError: undefined
				}
			};
		}

		const errorTypes = {
			'404': {
				status: 404,
				message: `can get exchanges data from our API, our team is probably already working to solve this issue`
			}
		}

		return {
			props: {
				exchanges: [],
				apiError: `Could not load, ${errorTypes[res.status].message}`
			}
		};
	}
</script>

<script lang="typescript"> 
	import { onMount } from 'svelte';
	import Table from '../lib/table/Table.svelte';

	export let exchanges = [];
	export let apiError: ApiError | undefined;

	onMount(async () => {});

	function formatNumber(n) {
		if (n <= 1000) {
			return (n / 1000).toLocaleString('en', {
				minimumFractionDigits: 3,
				maximumFractionDigits: 3
			});
		} else {
			return (n / 1000).toLocaleString('en', {
				minimumFractionDigits: 0,
				maximumFractionDigits: 0
			});
		}
	}
</script>

<svelte:head>
	<title>DEX trading and quantative finance datasets</title>
	<meta name="description" content="Download OHLCV and liquidity data for DEXes" />
</svelte:head>

<div class="container container-main">
	<section class="md-12">
		<div class="card">
			{#await exchanges}
				<p>...waiting</p>
			{:then users}
				<div class="card-body">
					<h1>Exchanges</h1>
					<Table rows={exchanges} apiError={apiError}/>
				</div>
			{:catch error}
				<p style="color: red">{error.message}</p>
			{/await}
		</div>
	</section>
</div>

<style>
</style>
