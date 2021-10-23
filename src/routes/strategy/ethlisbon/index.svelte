<script>
    import {TabContent, TabPane} from 'sveltestrap';
    import StrategyNav from '$lib/strategy/StrategyNav.svelte';

</script>

<svelte:head>
  <title>EthLisbon hackathon example</title>
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
  <div class="col-md-6">
    <div class="card bg-primary shadow-soft border-light">
      <div class="card-body">

        <p class="info">Position: <strong>Open</strong>, holding 100% ETH</p>

        <p class="info">Currently invested: $100,00</p>

        <div class="buttons">
          <button class="btn" disabled>
            Invest
          </button>

          <button class="btn" disabled>
            Withdraw
          </button>

        </div>
      </div>

    </div>

  </div>

  <div class="col-md-6">
    <div class="card bg-primary shadow-soft border-light">
      <div class="card-body">
        <h5>Key facts</h5>

        <p class="info">
          Expected profit: <strong>21%</strong>
          <a href="/"></a>
        </p>

        <p class="info">Trading started: <strong>o days ago</strong></p>

        <p class="info">Trades made: <strong>o</strong></p>

        <p class="info">Fee model: <strong>zero fee</strong></p>

        <p class="info">Developed by: <strong>ChainYoda fan boi</strong></p>

        <p class="info">Developer shares: <strong>100,00%</strong></p>

        <p class="info">Trades tokens: <strong>ETH, USDC</strong></p>

        <p class="info">Leverage: <strong>1x</strong></p>

        <p class="info">Markets: <strong>1inch on Polygon</strong></p>

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

    svg {
        width: 64px;
        display: block;
        margin: 5px auto;
    }

    .btn[disabled] {
        cursor: not-allowed;
    }
</style>
