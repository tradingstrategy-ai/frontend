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
          <h1>EthLisbon Aave 👻 boosted 🔥 Double Seven</h1>
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
