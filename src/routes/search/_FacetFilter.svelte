<script lang="ts">
	import { createEventDispatcher } from 'svelte';
  import Filter from "./_Filter.svelte";
  
  export let fieldName, options;
  export let selected = [];

  const dispatch = createEventDispatcher();
  $: dispatch("change", { fieldName, filter: getFilter(selected) });

  function getFilter(values) {
    return values.length ? `${fieldName}:=[${values}]` : null;
  }
</script>

<Filter bind:selected {fieldName} {options} />
