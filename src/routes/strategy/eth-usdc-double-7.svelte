<script>
    import {TabContent, TabPane} from 'sveltestrap';
    import StrategyNav from '$lib/strategy/StrategyNav.svelte';
</script>

<svelte:head>
  <title>EthLisbon hackathon example</title>
  <meta name="description" content="An example strategy">
</svelte:head>

<main>
  <section>
    <div class="container">
      <div class="row">
        <div class="col-md-12">
          <h1>ETH-USDC Double 5 strategy</h1>

          <div class="alert alert-danger" role="alert">
                      <span class="alert-inner--text">
                          This strategy is made for EthLisbon hackathon demo. Do not invest - the strategy runs on a testnet and is not real. You will lose all your money.
                      </span>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-12">
          <StrategyNav/>
        </div>
      </div>

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
      </div>

      <div class="row">
        <div class="col-md-12">
          <div class="card bg-primary shadow-soft border-light">
            <div class="card-body">
              <h5>Key facts</h5>

              <p class="info">Lifetime profit: <strong>5,66%</strong></p>

              <p class="info">Trading started: <strong>o days ago</strong></p>

              <p class="info">Fee model: <strong>15% performance fee against USDC</strong></p>

              <p class="info">Developed by: <strong>SushiIntern</strong></p>

              <p class="info">Developer shares: <strong>5.20%</strong></p>

              <p class="info">Trades tokens: <strong>ETH, USDC</strong></p>

              <p class="info">Leverage: <strong>1x</strong></p>

              <p class="info">Markets: <strong>Sushiswap on Ethereum</strong></p>

            </div>

          </div>

        </div>
      </div>

  </section>
</main>

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
