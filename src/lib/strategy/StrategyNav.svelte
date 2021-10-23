<script>
    export let root;
</script>

<div>
  <div class="nav-wrapper position-relative mb-4">
    <ul class="nav nav-pills flex-column flex-sm-row" id="tabs-text" role="tablist">
      <li class="nav-item mr-sm-3 mr-md-0">
        <a class="nav-link mb-sm-3 mb-md-0 active" id="tabs-text-1-tab" data-toggle="tab" href="#tabs-text-1" role="tab"
           aria-controls="tabs-text-1" aria-selected="true">Overview</a>
      </li>
      <li class="nav-item mr-sm-3 mr-md-0">
        <a class="nav-link mb-sm-3 mb-md-0" id="tabs-text-2-tab" data-toggle="tab" href="#tabs-text-2" role="tab"
           aria-controls="tabs-text-2" aria-selected="false">Performance</a>
      </li>

      <li class="nav-item mr-sm-3 mr-md-0">
        <a class="nav-link mb-sm-3 mb-md-0" id="tabs-text-3-tab" data-toggle="tab" href="#tabs-text-3" role="tab"
           aria-controls="tabs-text-3" aria-selected="false">Fund smart contract</a>
      </li>

      <li class="nav-item mr-sm-3 mr-md-0">
        <a class="nav-link mb-sm-3 mb-md-0" id="tabs-text-3-tab" data-toggle="tab" href="#tabs-text-3" role="tab"
           aria-controls="tabs-text-3" aria-selected="false">Algorithm source</a>
      </li>
    </ul>
  </div>
</div>

<style>
  .nav-item {
      width: 200px;
      text-align: center;
  }

  .nav-pills .nav-item:not(:last-child) {
      padding-right: 10px;
  }
</style>