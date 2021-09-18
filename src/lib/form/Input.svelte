<script>
    export let value;
    export let placeholder;
    export let label;
    export let name;
    export let id;
    export let required;
    export let errors;
    
    const getStyles = () => {
        if(name && errors[name]) {
          return `is-invalid`
        }
        return ``;
    }
</script>
  
<label for={id}>
  {#if required }*{/if} {label} 
</label>
<input class={`form-control ${getStyles()}`} bind:value {placeholder} {id} {name} {required} type="text" />