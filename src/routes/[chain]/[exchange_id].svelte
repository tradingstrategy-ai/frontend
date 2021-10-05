<script context="module">
    import { browser, dev } from '$app/env';

    export async function load({ page }) {
        const exchangeId = page.params.exchange_id;
        const chain = page.params.chain;
        const urlDetails = `https://matilda.tradingstrategy.ai/exchange-details?exchange_slug=${exchangeId.toLowerCase()}&chain_slug=${chain}`;
        const urlTopPairs = `https://matilda.tradingstrategy.ai/pairs?chain_slugs=${chain}&exchange_slugs=${exchangeId.toLowerCase()}`;
        const pairs = await fetch(urlTopPairs);

        if(!pairs.ok) {
            console.error(pairs);
            throw new Error(`Could not load {urlTopPairs}`);
        }

        const exchangesPairs = await pairs.json();
        const details = await fetch(urlDetails);
        const exchangesDetails = await details.json();

        const monthlyData = {
            period: 'Monthly',
            volume: exchangesDetails.buy_volume_30d,
            trade: 0,
        }

        const allTimeData = {
            period: 'All Time',
            volume: exchangesDetails.buy_volume_all_time,
            trade: exchangesDetails.buy_count_all_time,
        }

        const exchangeSummary = [
           monthlyData,
           allTimeData
        ]

        return {
            props: {
                exchangeId,
                chain,
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

    const columns = [ 'Period', 'Volume (USD)', 'Trades'];
	const options = {
	    order: [[ 1, "desc" ]],
        paging: false,
        info: false,
        searching: false,
		serverSide: false,
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

    onMount(async () => {
		if (browser) {
            const initDt = (await import('datatables.net-dt')).default;
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
    <!-- <Datatable
      columns={columns}
      options={options}
    /> -->

</div>
