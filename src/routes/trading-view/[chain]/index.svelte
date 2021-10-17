<script context="module">

    import { backendUrl } from '$lib/config';
	import { buildBreadcrumbs } from '$lib/helpers/html';
    import breadcrumbTranslations from '$lib/constants/Breadcrumb';

    /**
     * Display chain information and indexing status
     *
     */

    export async function load({ page, fetch }) {
        const chain_slug = page.params.chain;

        // Load and render exchange details on the server side
        // https://tradingstrategy.ai/api/explorer/#/default/web_chain_details
        const encoded = new URLSearchParams({exchange_slug, chain_slug});
        const apiUrl = `${backendUrl}/chain-details?${encoded}`;

        const resp = await fetch(apiUrl);

        if (!resp.ok) {
            if (resp.status === 404) {
                return;
            } else {
                console.error(resp);
                return {
                    status: resp.status,
                    error: new Error(
                        `Could not load data for the chain details: ${apiUrl}. See console for details.`
                    )
                };
            }
        }

        const details = await resp.json();

        const readableNames = {
            ...breadcrumbTranslations,
            [chain_slug]: details['chain_name']
        };

        console.log("Received chain details", details);

        return {
            props: {
                details,
                breadcrumbs: buildBreadcrumbs(page.path, readableNames)
            }
        };
    }
</script>

<script>
    import '$lib/styles/bodytext.css';
</script>

<svelte:head>
    <title>{details.chain_name} decentralised exchanges and trades</title>
    <meta name="description" content={`${details.chain_slug} available aexchanges and trading pairs`}>
</svelte:head>

<div class="container">

    <Breadcrumb breadcrumbs={breadcrumbs} />

    <div class="exchange-content">
        <h1>{details.chain_name} blockchain</h1>
    </div>
</div>


<style>
</style>
