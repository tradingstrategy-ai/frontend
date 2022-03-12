<!--
@component
Used for advanced searches; custom drop-down component for selecting from a
pre-defined set of sort options.

#### Usage:
```tsx
  <SortSelect bind:value />
```
-->
<script context="module" lang="ts">
  export const sortOptions = {
    default: {
      shortLabel: "relevance",
      longLabel: "relevance (text match, volume)",
      direction: "desc",
      value: ["_text_match:desc", "volume_24h:desc", "liquidity:desc"]
    },

    volume: {
      shortLabel: "volume",
      longLabel: "volume (high to low)",
      direction: "desc",
      value: ["volume_24h:desc", "_text_match:desc"]
    },

    liquidity: {
      shortLabel: "liquidity",
      longLabel: "liquidity (high to low)",
      direction: "desc",
      value: ["liquidity:desc", "_text_match:desc"]
    },

    priceChangeDesc: {
      shortLabel: "price change",
      longLabel: "price change (high to low)",
      direction: "desc",
      value: ["price_change_24h:desc", "_text_match:desc"]
    },

    priceChangeAsc: {
      shortLabel: "price change",
      longLabel: "price change (low to high)",
      direction: "asc",
      value: ["price_change_24h:asc", "_text_match:desc"]
    }
  };
</script>

<script lang="ts">
  export let value = "default";

  let className = "";
  export { className as class };
</script>

<div class="{className} {sortOptions[value].direction}">
    <label for="sort-select">{sortOptions[value].shortLabel}</label>
    <select id="sort-select" bind:value>
        {#each Object.entries(sortOptions) as [key, option] (key)}
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
