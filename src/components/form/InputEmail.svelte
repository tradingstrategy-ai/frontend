<script>
    export let value;
    export let placeholder;
    export let label;
    export let name;
    export let id;
    export let required;
    export let errors = {};
</script>
  
<label for={id}>
  {#if required }*{/if} {label} 
</label>
<input class="form-control" bind:value {placeholder} {id} {name} {required} type="email" />
<small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
{#if errors[name] && errors[name]}
    <p class="error-message">Email is required</p>
{/if}

<style>
    .error-message {
      color: red;
    }
</style>