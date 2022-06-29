<!--

Export data for exchange trading pair list

-->
<script context="module">
	import getApiError from '$lib/chain/getApiError';
	import breadcrumbTranslations, { buildBreadcrumbs } from '$lib/breadcrumb/builder';

	export async function load({ url, params, fetch, session }) {
		const { backendUrl } = session.config;
		const exchange_slug = params.exchange;
		const chain_slug = params.chain;

		// Load and render exchange details on the server side
		// https://tradingstrategy.ai/api/explorer/#/Exchange/web_exchange_details
		const encoded = new URLSearchParams({ exchange_slug, chain_slug });
		const apiUrl = `${backendUrl}/exchange-details?${encoded}`;

		const resp = await fetch(apiUrl);

		if (!resp.ok) {
			return getApiError(resp, 'Exchange', [chain_slug, exchange_slug]);
		}

		const details = await resp.json();

		const readableNames = {
			...breadcrumbTranslations,
			[exchange_slug]: details.human_readable_name,
			'export-data': 'Export data'
		};

		return {
			props: {
				exchange_slug,
				chain_slug,
				details,
				breadcrumbs: buildBreadcrumbs(url.pathname, readableNames)
			}
		};
	}
</script>

<script>
	import PairListExportPage from '$lib/content/PairListExportPage.svelte';
	import Breadcrumb from '$lib/breadcrumb/Breadcrumb.svelte';

	export let exchange_slug;
	export let chain_slug;
	export let details;
	export let breadcrumbs;

	const exchange_name = details.human_readable_name;
</script>

<svelte:head>
	<title>
		Export {details.human_readable_name} on ${details.chain_name} data
	</title>
	<meta
		name="description"
		content={`Download ${details.human_readable_name} on ${details.chain_name} trading pair data as Excel file`}
	/>
</svelte:head>

<div class="container">
	<Breadcrumb {breadcrumbs} />
	<PairListExportPage {chain_slug} {exchange_slug} {exchange_name} />
</div>
