<script>
    import {TabContent, TabPane} from 'sveltestrap';
    import StrategyNav from '$lib/strategy/StrategyNav.svelte';
    import Breadcrumb from '$lib/breadcrumb/Breadcrumb.svelte';

    import { page } from '$app/stores';

    import { buildBreadcrumbs } from "$lib/breadcrumb/builder";

      const readableNames = {
          ["strategy"]: "Strategies",
          ["ethlisbon"]: "EthLisbon",
          ["smart-contract"]: "Smart contract",
          ["performance"]: "Key performance metrics",
          ["source"]: "Algorithm source code",
      };

    $: breadcrumbs = buildBreadcrumbs($page.path, readableNames);

</script>

<svelte:head>
  <title>EthLisbon hackathon example</title>
  <meta name="description" content="An example strategy">
</svelte:head>

<main>
  <section>
    <div class="container">

      <Breadcrumb breadcrumbs={breadcrumbs} />

      <div class="row">
        <div class="col-md-12">
          <h1>ETH-USDC Double 5 strategy</h1>

          <div class="alert alert-danger" role="alert">
                      <span class="alert-inner--text">
                          This strategy is made for EthLisbon hackathon demo. Do not invest - the smart contract is unaudited proof of concept, wrote until severe lack of sleep.
                      </span>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-md-12">
          <StrategyNav/>
        </div>
      </div>

      <slot></slot>
    </div>
  </section>
</main>
