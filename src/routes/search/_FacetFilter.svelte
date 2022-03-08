<script lang="ts">
  import Filter from "./_Filter.svelte";

  export let fieldName, options;
  export let filter = null;

  let selected = [];

  $: filter = selected.length ? `${fieldName}:=[${selected}]` : null;
</script>

<Filter bind:selected {fieldName} {options} />
