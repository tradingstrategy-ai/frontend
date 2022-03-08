<script lang="ts">
  import { page } from "$app/stores";
  import { formatDollar } from "$lib/helpers/formatters";
  import tradingEntities from "$lib/search/trading-entities";
  import { ListGroup } from "sveltestrap";
  import SortSelect from "./_SortSelect.svelte";
  import FacetFilter from "./_FacetFilter.svelte";
  import RangeFilter from "./_RangeFilter.svelte";
  import ResultLineItem from "./_ResultLineItem.svelte";

  let q = $page.url.searchParams.get('q') || "";

  let isOpen = true;
  let filters = {}, filterVals = {}, filter_by = [];
  let sortOption = "default", sort_by = [];
  const facet_by = ["type", "blockchain", "exchange"];

  $: filter_by = Object.values(filterVals).filter((v) => v);
  $: tradingEntities.search({ q, facet_by, filter_by, sort_by });

  function handleFilterChange({ detail }) {
    filterVals[detail.fieldName] = detail.filter;
  }

  function clearAllFilters() {
    for (const name in filters) {
      filters[name] = [];
    }
  }
</script>

<svelte:head>
    <title>Search</title>
    <meta name="description" content="Search Trading Entities">
</svelte:head>

<main>
    <section>
        <div class="container">
            <div class="row my-3 my-md-0">
                <div class="col-md-3 d-none d-md-block">
                    <h1>Search</h1>
                </div>
                <div class="search-box col-md-9 d-flex align-items-center">
                    <input
                      type="search"
                      data-cy="search"
                      placeholder="search"
                      autocapitalize="none"
                      spellcheck="false"
                      bind:value={q}
                      on:focus={() => isOpen = true}
                    />
                    <SortSelect
                      class="d-none d-md-block"
                      bind:value={sortOption}
                      on:change={(e) => ({sort_by} = e.detail)}
                    />
                    <button
                      class:isOpen
                      class="close-filters d-md-none"
                      on:click={() => isOpen = false}
                    >Done</button>
                </div>
            </div>

            <div class="row mt-1">
              <div class:isOpen class="filters col-md-3">
                  <div class="row  mb-3">
                      <div class="col-6 col-md-12">
                          <button
                            class="clear-filters"
                            disabled={filter_by.length === 0}
                            on:click={clearAllFilters}
                          >× clear all filters</button>
                      </div>
                      <div class="col-6 d-md-none d-flex align-items-center">
                          <h2>Sort by:</h2>
                          <SortSelect
                            bind:value={sortOption}
                            on:change={(e) => ({sort_by} = e.detail)}
                          />
                      </div>
                  </div>
                  <div class="row">
                      <div class="col-6 col-md-12">
                          {#each $tradingEntities.facets as { field_name, counts } (field_name)}
                            <FacetFilter
                              bind:selected={filters[field_name]}
                              fieldName={field_name}
                              options={counts}
                              on:change={handleFilterChange}
                            />
                          {/each}
                      </div>
                      <div class="col-6 col-md-12">
                          <RangeFilter
                            bind:selected={filters['volume_24h']}
                            fieldName="volume_24h"
                            breakpoints={[0, 100, 1000, 10000, Infinity]}
                            formatter={formatDollar}
                            on:change={handleFilterChange}
                          />
                          <RangeFilter
                            bind:selected={filters['liquidity']}
                            fieldName="liquidity"
                            breakpoints={[0, 100, 1000, 10000, Infinity]}
                            formatter={formatDollar}
                            on:change={handleFilterChange}
                          />
                          <RangeFilter
                            bind:selected={filters['price_change_24h']}
                            fieldName="price_change_24h"
                            breakpoints={[-Infinity, -0.01, -0.0001, 0.0001, 0.01, Infinity]}
                            formatter={(v) => v.toLocaleString("en", { style: "percent",  minimumFractionDigits: 1 })}
                            on:change={handleFilterChange}
                          />
                      </div>
                  </div>
              </div>
              <div class="results col-md-9 col-sm-12">
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
  .search-box {
    gap: 1em;
    max-width: 630px;
  }

  h2 {
    font-size: 1rem;
    margin: 0 1ex 0 0;
    white-space: nowrap;
  }

  input {
    flex: 1;
    height: 40px;
    width: 100%;
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

  button.close-filters {
    background-color: #44476a;
    border: none;
    border-radius: 1em;
    height: 100%;
    padding: 0 1em;
    font-weight: 600;
    font-size: 0.75rem;
    color: white;
    text-transform: uppercase;
    opacity: 0.8;
  }

  button.clear-filters {
    border: none;
    background-color: transparent;
    padding: 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--link-underline);
    cursor: pointer;
  }

  button.clear-filters:hover {
    border-bottom: 1px solid var(--link-underline);
  }

  button.clear-filters:disabled {
    color: black;
    border-color: transparent;
    opacity: 0.5;
    text-decoration: none;
    cursor: default;
  }

  @media (max-width: 768px) {
    .filters, .close-filters {
      display: none;
    }

    .isOpen {
      display: block;
    }
  }

  @media (max-width: 576px) {
    .results {
      padding: 0;
    }
  }
</style>
