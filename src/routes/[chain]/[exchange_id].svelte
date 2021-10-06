<script context="module">
    import {browser} from '$app/env';
    import {backendUrl} from '$lib/config';

    // Load and render exchange details on the server side
    // https://tradingstrategy.ai/api/explorer/#/Exchange/web_exchange_details
    export async function load({page}) {
        const exchange_slug = page.params.exchange_id;
        const chain_slug = page.params.chain;

        //const details = `https://matilda.tradingstrategy.ai/exchange-details?exchange_slug=${exchangeId.toLowerCase()}&chain_slug=${chain}`;
        const encoded = new URLSearchParams({exchange_id, chain_slug});
        const apiUrl = `${backendUrl}/exchange-details?${encoded}`;

        const resp = await fetch(apiUrl);

        if (!resp.ok) {
            if (resp.status === 404) {
                return {
                    status: 404,
                    error: `Exchange not found: ${exchange_slug}`
                };
            } else {
                console.error(resp);
                return {
                    status: resp.status,
                    error: new Error(
                        `Could not load data for trading pair: ${apiUrl}. See console for details.`
                    )
                };
            }
        }

        const details = await resp.json();

        return {
            props: {
                exchange_slug,
                chain_slug,
                details
            }
        };
    }
</script>

<script>
    import Datatable from '$lib/Datatable/datatable.svelte';
    import {formatNumber} from '$lib/helpers/formatters';
    import {onMount, tick} from 'svelte';

    export let exchange_slug;
    export let chain;

    export let chain_slug;
    export let details;

    const columnsPairs = ['Quote', 'Volume 24h', 'Liquidity', 'Price'];
    const optionsPairs = {
        order: [[1, 'desc']],
        serverSide: false,
        ajax: {
            url: `https://matilda.tradingstrategy.ai/pairs?chain_slugs=${chain}&exchange_slugs=${exchangeId.toLowerCase()}`,
            type: 'GET',
            dataSrc: function (exchangePairs) {
                return exchangePairs.results.map((exchangePair) => [
                    `<a class="nav-link" href="/${chain}/${exchangeId.toLowerCase()}/${
                        exchangePair.base_token_symbol
                    }-${exchangePair.quote_token_symbol}">${exchangePair.base_token_symbol}-${
                        exchangePair.quote_token_symbol
                    }</a>`,
                    `${exchangePair.base_token_symbol}/${exchangePair.quote_token_symbol}`,
                    exchangePair.usd_volume_24h,
                    exchangePair.liquidity_change_24h,
                    exchangePair.usd_price_latest
                ]);
            }
        }
    };

    onMount(async () => {
        if (browser) {
            const initDt = (await import('datatables.net-dt')).default();
            initDt();
        }
    });
</script>

<svelte:head>
    <title>
        {details.human_readable - name} trading on {details.chain_slug}
    </title>
    <meta
            name="description"
            content={'Decentralise exchange top trading pairs for' + details.human_readable - name}
    />
</svelte:head>

<div class="container">
    <h1>{details.human_readable_name} on {chain_slug}</h1>

    <h2>Trading Pairs</h2>
    <Datatable columns={columnsPairs} options={optionsPairs}/>
</div>
