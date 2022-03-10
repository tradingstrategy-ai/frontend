<!--
@component
Used for advanced searches; custom drop-down component for selecting from a
pre-defined set of sort options.

#### Usage:
```tsx
  <SortSelect bind:value on:change={handleChange} />
```
-->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

  export let value = "default";

  let className = "";
  export { className as class };

  const dispatch = createEventDispatcher();

  function dispatchChange() {
    dispatch("change", options[value]);
  }

  // this is needed to ensure the sort_by value is set on initial load
  onMount(dispatchChange);

  const options = {
    default: {
      shortLabel: "text match",
      longLabel: "text match",
      direction: "desc",
      sort_by: ["_text_match:desc", "volume_24h:desc"]
    },
    volume: {
      shortLabel: "volume",
      longLabel: "volume (high to low)",
      direction: "desc",
      sort_by: ["volume_24h:desc", "_text_match:desc"]
    },
    liquidity: {
      shortLabel: "liquidity",
      longLabel: "liquidity (high to low)",
      direction: "desc",
      sort_by: ["liquidity:desc", "_text_match:desc"]
    },
    priceChangeDesc: {
      shortLabel: "price change",
      longLabel: "price change (high to low)",
      direction: "desc",
      sort_by: ["price_change_24h:desc", "_text_match:desc"]
    },
    priceChangeAsc: {
      shortLabel: "price change",
      longLabel: "price change (low to high)",
      direction: "asc",
      sort_by: ["price_change_24h:asc", "_text_match:desc"]
    }
  };
</script>

<div class="{className} {options[value].direction}">
    <label for="sort-select">{options[value].shortLabel}</label>
    <select id="sort-select" bind:value on:change={dispatchChange}>
        {#each Object.entries(options) as [key, option] (key)}
            <option value={key}>
                {option.longLabel}
            </option>
        {/each}
    </select>
</div>

<style>
  div {
    position: relative;
    width: 7em;
  }

  div > * {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translate(0, -50%);
  }

  label {
    font-weight: 500;
    color: #44476a;
    white-space: nowrap;
  }

  label::before {
    content: "▾";
    display: inline-block;
    font-size: 1.25em;
    line-height: 1;
    margin-right: 0.5ex;
  }

  .asc label::before {
    transform: rotate(180deg) translate(0, -0.4ex);
  }

  select {
    overflow: hidden;
    appearance: none;
    -webkit-appearance: none;
    background: none;
    color: transparent;
    border: none;
    outline: none;
  }

  option {
    color: initial;
  }
</style>
