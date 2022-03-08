<script lang="ts">
  export let sort_by;

  const options = [
    {
      shortLabel: "text match",
      longLabel: "text match",
      direction: "desc",
      value: ["_text_match:desc", "volume_24h:desc"]
    },
    {
      shortLabel: "volume",
      longLabel: "volume (high to low)",
      direction: "desc",
      value: ["volume_24h:desc", "_text_match:desc"]
    },
    {
      shortLabel: "liquidity",
      longLabel: "liquidity (high to low)",
      direction: "desc",
      value: ["liquidity:desc", "_text_match:desc"]
    },
    {
      shortLabel: "price change",
      longLabel: "price change (high to low)",
      direction: "desc",
      value: ["price_change_24h:desc", "_text_match:desc"]
    },
    {
      shortLabel: "price change",
      longLabel: "price change (low to high)",
      direction: "asc",
      value: ["price_change_24h:asc", "_text_match:desc"]
    }
  ];

  let selected = options[0];
  $: sort_by = selected.value;
</script>

<div class={selected.direction}>
    <label for="sort-select">{selected.shortLabel}</label>
    <select id="sort-select" bind:value={selected}>
        {#each options as option, idx (idx)}
            <option value={option}>
                {option.longLabel}
            </option>
        {/each}
    </select>
</div>

<style>
  div {
    position: relative;
    width: 8em;
    height: 100%;
  }

  div > * {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translate(0, -50%);
  }

  label {
    font-size: 1rem;
    font-weight: 500;
    color: #44476a;
  }

  label::before {
    content: "▾";
    display: inline-block;
    font-size: 1.25rem;
    line-height: 1rem;
    margin-right: 0.6ex;
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
