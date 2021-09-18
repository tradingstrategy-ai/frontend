<script>
    export let value;
    export let placeholder;
    export let label;
    export let name;
    export let id;
    export let required;
  </script>
  
<label for={id}>
 {#if required }*{/if} {label} 
</label>
<input class="form-control" bind:value {placeholder} {id} {name} {required} type="text" />