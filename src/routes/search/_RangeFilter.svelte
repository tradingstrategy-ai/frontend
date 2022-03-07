<script>
  export let fieldName, breakpoints, filter;

  // default formatter returns value unchanged
  export let formatter = (val) => val;

  let selected = [];

  $: filter = getFilter(selected.flat());

  const options = [];
  for (let i = 0; i < breakpoints.length - 1; i++) {
    options.push(breakpoints.slice(i, i + 2));
  }

  function getLabel([ min, max ]) {
    if (Number.isFinite(min) && Number.isFinite(max)) {
      return `${formatter(min)} - ${formatter(max)}`;
    } else if (Number.isFinite(min)) {
      return `> ${formatter(min)}`;
    } else if (Number.isFinite(max)) {
      return `< ${formatter(max)}`;
    }
  }

  function getFilter(values) {
    if (values.length > 0) {
      const min = Math.min(...values);
      const max = Math.max(...values);
      const filters = [];
      if (Number.isFinite(min)) filters.push(`${fieldName}:>=${min}`);
      if (Number.isFinite(max)) filters.push(`${fieldName}:<${max}`);
      return filters.join(" && ");
    }
  }
</script>

<h2>{fieldName.replace(/_/g, " ")}</h2>
<div class="option-group">
    {#each options as option, idx (idx)}
        <label>
          <input type="checkbox" bind:group={selected} value={option} />
          <div class="value">{getLabel(option)}</div>
        </label>
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

  .value {
    flex: 1;
    overflow: hidden;
    text-transform: capitalize;
  }
</style>