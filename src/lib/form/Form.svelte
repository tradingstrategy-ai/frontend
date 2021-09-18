<script lang="typescript">
    import Input from "./Input.svelte";
  
    export let onSubmit;
    export let fields;
  
    function isFormValid(data: {[fieldName: string]: any}): boolean {
      if(!isRequiredFieldValid(data.email)){
        return false
      }

      if(!isRequiredFieldValid(data.password)){
        return false
      }
      
      return true
    } 

    function isRequiredFieldValid(value) {
      return value != null && value !== ""
    }

    const fieldsToObject = (fields) =>
      fields.reduce((p, c) => ({ ...p, [c.name]: c.value }), {});


    const handleSubmit = () => {
      onSubmit(fieldsToObject(fields));
    }

  </script>
  
  <style>
    :global(input, select) {
      margin: 5px;
    }

    .error-message {
      color: red;
    }
  </style>
  
  <form on:submit|preventDefault={() => handleSubmit()}>
      {#each fields as field}
          {#if field.type === 'Input'}
            <div class="form-group mb-3">
              <Input bind:value={field.value} label={field.label} placeholder={field.placeholder} required={field.required} />
            </div>
          {:else if field.type === 'Email'}
           <div class="form-group mb-3">
              <Input bind:value={field.value} label={field.label} placeholder={field.placeholder} required={field.required}/>
              <small id="emailHelp" class="form-text text-muted">We'll never share your email with anyone else.</small>
           </div>  
          {/if}
      {/each}
      <button type="submit">Submit</button>
  </form>


  