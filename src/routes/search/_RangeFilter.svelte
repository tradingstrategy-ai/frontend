<script>
  import Filter from "./_Filter.svelte";

  export let fieldName, breakpoints;
  export let filter = null;

  // default formatter returns value unchanged
  export let formatter = (val) => val;

  let selected = [];

  $: filter = getFilter(selected.flat());

  const options = [];
  for (let i = 0; i < breakpoints.length - 1; i++) {
    const value = breakpoints.slice(i, i + 2);
    const label = getLabel(value);
    options.push({ label, value });
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

<Filter bind:selected {fieldName} {options} />
