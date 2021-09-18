<script>
    export let value;
    export let placeholder;
    export let label;
    export let name;
    export let id;
  </script>
  
<label for={id}>{label}</label>
<input class="form-control" bind:value {placeholder} {id} {name} type="text" />