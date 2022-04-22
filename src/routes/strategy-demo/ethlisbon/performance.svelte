<script>
    import {TabContent, TabPane} from 'sveltestrap';
    import StrategyNav from '$lib/strategy/StrategyNav.svelte';

    import backtest from "./backtest.png";
    import trades from "./trades.png";
</script>

<svelte:head>
  <title>EthLisbon hackathon example</title>
  <meta name="description" content="An example strategy">
</svelte:head>


<div class="row">
  <div class="col-md-12">
    <h3>Live trades</h3>

    <div class="alert alert-danger" role="alert">
      <span class="alert-inner--text">
          ❌ No live trades available yet. This strategy trades average 17 times a month.
      </span>
    </div>
  </div>
</div>

<div class="row">
  <div class="col-md-12">
    <h3>Backtested performance</h3>
  </div>

  <div class="col-md-12">
    <div class="card-deck">
      <div class="card bg-primary shadow-soft border-light">
        <div class="card-body">
          <table class="table table-first">
            <tbody>
              <tr class="row-first">
                <th>Return %</th>
                <td>21%</td>
              </tr>
              <tr>
                <th>Trade win percent</th>
                <td>69%</td>
              </tr>
              <tr>
                <th>Total trades done</th>
                <td>225</td>
              </tr>

              <tr>
                <th>👻 AAVE boost: Extra returns on interest</th>
                <td>3.7243 %</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="card card-white bg-primary shadow-soft border-light">
        <div class="card-body">
          <img src={trades}>
        </div>
      </div>
    </div>
  </div>

  <div class="col-md-12">
    <div class="card card-backtest card-white bg-primary shadow-soft border-light">
      <div class="card-body">
        <img src={backtest}>
      </div>
    </div>
  </div>

  <div class="col-md-12">
    <div class="card bg-primary shadow-soft border-light">
      <div class="card-body">

        <h5>Backtested performance details</h5>

        <table class="table">
          <tbody>
            <tr class="row-first">
              <th>Annual return %</th>
              <td>21%</td>
            </tr>
            <tr>
              <th>Cash at start</th>
              <td>$10,000.00</td>
            </tr>
            <tr>
              <th>Value at end</th>
              <td>$11,718.41</td>
            </tr>
            <tr>
              <th>Trade win percent</th>
              <td>69%</td>
            </tr>
            <tr>
              <th>Total trades done</th>
              <td>225</td>
            </tr>
            <tr>
              <th>Won trades</th>
              <td>156</td>
            </tr>
            <tr>
              <th>Lost trades</th>
              <td>69</td>
            </tr>
            <tr>
              <th>Stop losses triggered</th>
              <td>22</td>
            </tr>
            <tr>
              <th>Stop loss % of all</th>
              <td>10%</td>
            </tr>
            <tr>
              <th>Stop loss % of lost</th>
              <td>32%</td>
            </tr>
            <tr>
              <th>Zero profit trades</th>
              <td>0</td>
            </tr>
            <tr>
              <th>Positions open at the end</th>
              <td>1</td>
            </tr>
            <tr>
              <th>Realised profit and loss</th>
              <td>$2,090.84</td>
            </tr>
            <tr>
              <th>Portfolio unrealised value</th>
              <td>$2,957.61</td>
            </tr>
            <tr>
              <th>👻 AAVE boost: Extra returns on interest</th>
              <td>$372.43</td>
            </tr>
            <tr>
              <th>Cash left at the end</th>
              <td>$8,760.80</td>
            </tr>
          </tbody>
        </table>

      </div>

    </div>

  </div>

</div>



<style>
    h1 {
        margin: 30px 0;
    }

    h3 {
        margin-bottom: 30px;
    }

    .row-first td, .row-first th {
      border-top: 0;
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

    .card-white .card-body {
        background: white;
    }

    .card-backtest {
        margin: 30px 0;
    }
</style>
