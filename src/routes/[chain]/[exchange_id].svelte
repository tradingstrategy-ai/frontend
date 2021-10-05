<script context="module">
    import { browser, dev } from '$app/env';

    export async function load({ page }) {
        const exchangeId = page.params.exchange_id;
        const chain = page.params.chain;

        return {
          props: {
            exchangeId,
            chain
          }
        }
    }
</script>

<script>
	import Datatable from '$lib/Datatables/datatable.svelte';
	import { formatNumber } from '$lib/helpers/formatters';
	import { onMount, tick } from 'svelte';
    export let exchangeId;
    export let chain;

    const columns    = [ 'Period', 'Volume (USD)', 'Trades'];
	const options = {
	    order: [[ 1, "desc" ]],
		serverSide: false,
        paging: false,
        info: false,
        searching: false,
		ajax: {
            url: `https://matilda.tradingstrategy.ai/exchange-details?exchange_slug=${exchangeId.toLowerCase()}&chain_slug=${chain}`,
            type: 'GET',
            dataSrc: function (exchangeDetails) {
                const monthlyData = {
                    period: 'Monthly',
                    volume: formatNumber(exchangeDetails.buy_volume_30d),
                    trade: 0,
                };

                const allTimeData = {
                    period: 'All Time',
                    volume: formatNumber(exchangeDetails.buy_volume_all_time),
                    trade: exchangeDetails.buy_count_all_time,
                };

                return [
                    Object.values(monthlyData),
                    Object.values(allTimeData)
                ];
            }
        }
	}

    const columnsPairs = [ 'Quote', 'Volume 24h', 'Liquidity', 'Price' ];
	const optionsPairs = {
	    order: [[ 1, "desc" ]],
		serverSide: false,
		ajax: {
            url: `https://matilda.tradingstrategy.ai/pairs?chain_slugs=${chain}&exchange_slugs=${exchangeId.toLowerCase()}`,
            type: 'GET',
            dataSrc: function (exchangePairs) {
                return exchangePairs.results.map((exchangePair) => [
                    `<a class="nav-link" href="/${chain}/${exchangeId.toLowerCase()}/${exchangePair.base_token_symbol}-${exchangePair.quote_token_symbol}">${exchangePair.base_token_symbol}-${exchangePair.quote_token_symbol}</a>`,
                    `${exchangePair.base_token_symbol}/${exchangePair.quote_token_symbol}`,
                    exchangePair.usd_volume_24h,
                    exchangePair.liquidity_change_24h,
                    exchangePair.usd_price_latest
                ]);
            }
        }
	}

    onMount(async () => {
		if (browser) {
            const initDt = (await import('datatables.net-dt')).default();
			initDt();
		}
	});
</script>

<svelte:head>
	<title>DEX trading and quantative finance datasets</title>
	<meta name="description" content="Download OHLCV and liquidity data for DEXes" />
</svelte:head>

<div class="container">
    <h1>Exchange Details {exchangeId}</h1>
    <h2>Summary</h2>
        <Datatable
            columns={columns}
            options={options}
        />
    <h2>Top Pairs</h2>
        <Datatable
            columns={columnsPairs}
            options={optionsPairs}
        />
</div>
