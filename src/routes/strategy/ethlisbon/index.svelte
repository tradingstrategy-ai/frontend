<script>
    import {TabContent, TabPane} from 'sveltestrap';
    import Investor from '$lib/web3/Investor.svelte';

    import { page } from '$app/stores';

    import polygon from '$lib/assets/logos/polygon.svg';
    import oneinch from '$lib/assets/logos/1inch.svg';

    $: current = $page.path.split('/').pop();

</script>

<svelte:head>
  <title>EthLisbon Aave 👻 boosted 🔥 Double Seven</title>
  <meta name="description" content="An example strategy">
</svelte:head>


<div class="row">
  <div class="col-md-12">
    <p>
      This strategy buys into ETH-USDC when the price is raising. When there is no position open, the strategy
      accures interest in USDC pool in Aave.
    </p>
  </div>
</div>

<div class="row">
  <div class="col-md-12">
    <div class="card-deck">
      <div class="card bg-primary shadow-soft border-light">
        <div class="card-body">
          <h5>Invest</h5>

          <Investor/>

        </div>

      </div>

      <div class="card bg-primary shadow-soft border-light">
        <div class="card-body">
          <h5>Key facts</h5>

          <p class="info">
            Expected profit: <strong>21%</strong>
            <a href="/"></a>
          </p>

          <p class="info">Markets: <strong><img src={oneinch}>1inch on <img src={polygon}> Polygon</strong></p>

          <p class="info">Trades tokens: <strong>ETH, USDC</strong></p>

          <p class="info">Trading started: <strong>o days ago</strong></p>

          <p class="info">Trades made: <strong>o</strong></p>

          <p class="info">Leverage: <strong>1x</strong></p>

          <p class="info">Fee model: <strong>zero fee</strong></p>

          <p class="info">Developed by: <strong>ChainYoda fan boi</strong></p>

          <p class="info">Developer shares: <strong>100,00%</strong></p>

        </div>
      </div>
    </div>
  </div>
</div>


<style>
    h1 {
        margin: 30px 0;
    }

    .card {
    }

    img {
        width: 24px;
    }

    svg {
        width: 64px;
        display: block;
        margin: 5px auto;
    }

    .btn[disabled] {
        cursor: not-allowed;
    }
</style>
