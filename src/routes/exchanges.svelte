<script>
    import { onMount } from 'svelte';
    import Table from "../lib/table/Table.svelte";

    const exchangesMock = [
        { id: 1, name: 'Uniswap v2', volume: 10470075809.75 },
        { id: 2, name: 'Sushiswap v2', volume: 55996876388.92 },
        { id: 3, name: 'Shiba Swap v2', volume: 10470075809.75 },
        { id: 4, name: 'Mikko Swap', volume: 50000.75 },
        { id: 5, name: 'Pancake Swap', volume: 231231.92 },
        { id: 6, name: '1 Inch', volume: 10470075809.75 },
        { id: 7, name: 'Salmon is the new sushi', volume: 10470075809.75 },
        { id: 8, name: 'Ape Swap', volume: 55996876388.92 },
        { id: 9, name: 'Divance Swap v2', volume: 10470075809.75 },
    ]

    let echanges = [];

    onMount(async () => {

    })

    function formatNumber(n) {
		if(n <= 1000) {
			return (n/1000).toLocaleString("en",  {minimumFractionDigits: 3, maximumFractionDigits: 3})
		} else{
			return (n/1000).toLocaleString("en",  {minimumFractionDigits: 0, maximumFractionDigits: 0})
		}
	}

</script>

<svelte:head>
	<title>DEX trading and quantative finance datasets</title>
	<meta name="description" content="Download OHLCV and liquidity data for DEXes">
</svelte:head>

<div class="container container-main">
	<section class="md-12">
		<div class="card">
			<div class="card-body">
				<h1>Exchanges</h1>
                <Table rows={exchangesMock} />
			</div>
		</div>
	</section>
</div>


<style>
    
</style>