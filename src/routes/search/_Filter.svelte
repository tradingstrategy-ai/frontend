<!--
@component
Display filter options as checkboxes search queries.

#### Usage:
```tsx
  <Filter
    bind:selected
    fieldName="search_field_1"
    options={[option1, option2]}
  />
```
-->
<script context="module" lang="ts">
  export interface FilterOption {
    value: string;
    label?: string;
    count?: number;
  }
</script>

<script lang="ts">
  export let fieldName: string;
  export let options: FilterOption[];
  export let selected: string[] = [];
</script>

<h2>{fieldName.replace(/_/g, " ")}</h2>
<div class="option-group">
    {#each options as { label, value, count } (value)}
        {#if value}
            <label>
                <input type="checkbox" bind:group={selected} {value} />
                <div class="label">{label || value}</div>
                {#if count}
                    <div class="count">{count.toLocaleString('en')}</div>
                {/if}
            </label>
        {/if}
    {/each}
</div>

<style>
  h2 {
    font-size: 1rem;
    text-transform: capitalize;
  }

  .option-group {
    margin-bottom: 1.25em;
    max-width: 200px;
  }

  label {
    display: flex;
    justify-content: left;
    align-items: center;
    gap: 1ex;
    line-height: 1.2;
  }

  .label {
    flex: 1;
    overflow: hidden;
    text-transform: capitalize;
  }

  .count {
    padding: 0px 4px;
    border-radius: 4px;
    font-size: 0.75rem;
    line-height: 1.4;
    font-weight: 400;
    background-color: #99999988;
  }
</style>
