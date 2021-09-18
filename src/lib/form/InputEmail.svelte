<script>
    export let value;
    export let placeholder;
    export let label;
    export let name;
    export let id;
    export let required;
    export let error;
</script>
  
<label for={id}>
  {#if required }*{/if} {label} 
</label>
<input class="form-control" bind:value {placeholder} {id} {name} type="email" />
{#if error.required}
    <p class="error-message">Email is required</p>
{/if}