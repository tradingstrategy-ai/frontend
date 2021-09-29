<script context="module"> 
    export async function load({ page }) {
        const exchangeId = page.params.exchange;
        const chain = page.params.chain;
        const pairId = page.params.pair_id;

        const pairs = [
            {
                period: 'daily',
                volume: 23123,
                trade: 131
            },
            {
                period: 'monthly',
                volume: 23123,
                trade: 131
            }, 
            {
                period: 'yearly',
                volume: 23123,
                trade: 131
            }
        ]

        // const urlDetails = `https://matilda.tradingstrategy.ai/exchange-details?exchange_slug=${exchangeId.toLowerCase()}&chain_slug=${chain}`;
        // const urlTopPairs = `https://matilda.tradingstrategy.ai/pairs?chain_slugs=${chain}&exchange_slugs=${exchangeId.toLowerCase()}`;
        // const pairs = await fetch(urlTopPairs);
        // const exchangesPairs = await pairs.json();
        // const details = await fetch(urlDetails);
        // const exchangesDetails = await details.json();

        return {
            props: {
                pairId,
                exchangeId,
                chain,
                pairs
            }
        }
    }
</script>

<script>
    import TradingViewWidget from "svelte-tradingview-widget";
    import TablePairs from '../../../components/table_quote_summary/Table.svelte';
    export let pairId;
    export let chain;
    export let exchangeId;
    export let pairs;

    let options = { symbol: "BINANCE:ETHUSDT", theme: "dark", autosize: false, locale: "fr" };
</script>

<div class="container">
    <h1>{pairId} trading on {chain}</h1>
    <h2>Candles</h2>
    <TradingViewWidget {options}/>
    <h2>Pair Summary</h2>
    <TablePairs rows={pairs} />
</div>  
