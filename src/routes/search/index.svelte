<script lang="ts">
  import { page } from "$app/stores";
  import { formatDollar } from "$lib/helpers/formatters";
  import tradingEntities from "$lib/search/trading-entities";
  import { ListGroup } from "sveltestrap";
  import FacetFilter from "./_FacetFilter.svelte";
  import RangeFilter from "./_RangeFilter.svelte";
  import ResultLineItem from "./_ResultLineItem.svelte";

  let q = $page.url.searchParams.get('q') || "";

  let filters = {};

  $: tradingEntities.search({
    q,
    facet_by: ["type", "blockchain", "exchange"],
    filter_by: Object.values(filters).filter((v) => v), // refactor "filter filter" into tradingEntities
    sort_by: ["_text_match:desc", "volume_24h:desc"]
  });
</script>

<svelte:head>
    <title>Search</title>
    <meta name="description" content="Search Trading Entities">
</svelte:head>

<main>
    <section>
        <div class="container">
            <div class="row">
                <div class="col-md-3">
                    <h1>Search</h1>
                </div>
                <div class="col-md-9 col-sm-12 d-flex align-items-center">
                    <input
                      type="search"
                      data-cy="search"
                      placeholder="search"
                      autocapitalize="none"
                      spellcheck="false"
                      bind:value={q}
                    />
                </div>
            </div>

            <div class="row mt-1">
              <div class="filters col-md-3">
                  {#each $tradingEntities.facets as { field_name, counts } (field_name)}
                    <FacetFilter
                      bind:filter={filters[field_name]}
                      fieldName={field_name}
                      options={counts}
                    />
                  {/each}
                  <RangeFilter
                    bind:filter={filters['volume_24h']}
                    fieldName="volume_24h"
                    breakpoints={[0, 100, 1000, 10000, Infinity]}
                    formatter={formatDollar}
                  />
                  <RangeFilter
                    bind:filter={filters['liquidity']}
                    fieldName="liquidity"
                    breakpoints={[0, 100, 1000, 10000, Infinity]}
                    formatter={formatDollar}
                  />
                  <RangeFilter
                    bind:filter={filters['price_change_24h']}
                    fieldName="price_change_24h"
                    breakpoints={[-Infinity, -0.01, -0.0001, 0.0001, 0.01, Infinity]}
                    formatter={(v) => v.toLocaleString("en", { style: "percent",  minimumFractionDigits: 1 })}
                  />
              </div>
              <div class="col-md-9 col-sm-12">
                  {#if /^\s*$/.test(q)}
                      <div>Search exchanges, tokens and trading pairs.</div>
                  {:else}
                      <ListGroup>
                          {#each $tradingEntities.hits as { document }, index (document.id)}
                              <ResultLineItem {document} />
                          {/each}
                      </ListGroup>
                  {/if}
              </div>
            </div>
        </div>
    </section>
</main>

<style>
  input {
    flex: 1;
    height: 40px;
    width: 100%;
    max-width: 500px;
    padding: 0 1ex 0 2em;
    border: 2px solid #44476a;
    border-radius: 20px;
    outline: none;
    background: rgba(255, 255, 255, 0.5) url("/images/search.svg") 1ex 55%/16px no-repeat;
    font-size: 1rem;
    color: #44476a;
  }

  input:focus {
    background-color: rgba(255, 255, 255, 0.75);
    box-shadow: 0 0 10px #44476a55;
  }

  input::placeholder {
    color: #44476a80;
  }
</style>
