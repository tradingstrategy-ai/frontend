<script>
    import { page } from '$app/stores';

    $: current = $page.url.pathname.split('/').pop();
</script>

<div>
  <div class="nav-wrapper position-relative mb-4">
    <ul class="nav nav-pills flex-column flex-sm-row" id="tabs-text" role="tablist">
      <li class="nav-item mr-sm-3 mr-md-0">
        <a class="nav-link mb-sm-3 mb-md-0 active" class:active="{current == 'ethlisbon'}" id="tabs-text-1-tab" data-toggle="tab" href="/strategy/ethlisbon" role="tab"
           aria-controls="tabs-text-1" aria-selected="true">Overview</a>
      </li>
      <li class="nav-item mr-sm-3 mr-md-0">
        <a class="nav-link mb-sm-3 mb-md-0" class:active="{current == 'performance'}" id="tabs-text-2-tab" data-toggle="tab" href="/strategy/ethlisbon/performance" role="tab"
           aria-controls="tabs-text-2" aria-selected="false">Performance</a>
      </li>

      <li class="nav-item mr-sm-3 mr-md-0">
        <a class="nav-link mb-sm-3 mb-md-0" class:active="{current == 'smart-contract'}" id="tabs-text-3-tab" data-toggle="tab" href="/strategy/ethlisbon/smart-contract" role="tab"
           aria-controls="tabs-text-3" aria-selected="false">Fund smart contract</a>
      </li>

      <li class="nav-item mr-sm-3 mr-md-0">
        <a class="nav-link mb-sm-3 mb-md-0" class:active="{current == 'source'}" id="tabs-text-3-tab" data-toggle="tab" href="/strategy/ethlisbon/source" role="tab"
           aria-controls="tabs-text-3" aria-selected="false">Algorithm source</a>
      </li>
    </ul>
  </div>
</div>

<style>

  .nav-wrapper {
      margin-bottom: 0px !important;
  }

  .nav-item {
      width: 200px;
      text-align: center;
  }

  .nav-pills .nav-item:not(:last-child) {
      padding-right: 10px;
  }
</style>