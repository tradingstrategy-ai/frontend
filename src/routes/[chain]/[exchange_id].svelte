<script context="module"> 
    export async function load({ page }) {
        const exchangeId = page.params.exchange_id;
        const chain = page.params.chain;
        const urlDetails = `https://matilda.tradingstrategy.ai/exchange-details?exchange_slug=${exchangeId.toLowerCase()}&chain_slug=${chain}`;
        const urlTopPairs = `https://matilda.tradingstrategy.ai/pairs?chain_slugs=${chain}&exchange_slugs=${exchangeId.toLowerCase()}`;
        const pairs = await fetch(urlTopPairs);
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
                exchangeSummary,
                exchangesPairs,
                exchangeId
            }
        }
    }
</script>

<script>
    import TablePairs from '../../components/table_top_pairs/Table.svelte';
    import TableExchangeDetails from '../../components/table_volume_summary/Table.svelte';
    export let exchangesPairs;
    export let exchangeId;
    export let exchangeSummary;
</script>

<div class="container">
    <h1>    {exchangeId}</h1>
    <h2>Summary</h2>
    <TableExchangeDetails rows={exchangeSummary} />
    <h2>Top Pairs</h2>
    <TablePairs rows={exchangesPairs.results} />

</div>  
 