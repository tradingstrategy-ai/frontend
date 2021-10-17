<script lang="ts">
    import Input from "./Input.svelte";
    import InputEmail from "./InputEmail.svelte";
  
    export let onSubmit;
    export let fields;
    export let formErrors = {};
    export let submitted: boolean = false;
  
    function isFormValid(data: {[fieldName: string]: any}): boolean {
      let isValid: boolean = true;
      const isRequiredFieldValid = (value) => {
        return value != null && value !== ""
      }

      data.forEach((field) => {
        if (!isRequiredFieldValid(field)) {
          formErrors[field] = { ...formErrors[field], ...{ requiredError: true }};
          isValid = false;
        } else {
          formErrors[field] = { ...formErrors[field], ...{ requiredError: false }};  
        } 
      });
      return isValid;
    } 

    const clientRequest = async (fields) => {
      const response = await fetch('https://httpbin.org/post', {
			  method: 'POST',
			  body: JSON.stringify(fields)
      });
      const json = await response.json()
      const result = JSON.stringify(json)
      submitted = true;
      //console.log(result)
		}
		
    const fieldsToObject = (fields) =>
      fields.reduce((p, c) => ({ ...p, [c.name]: c.value }), {});

    const handleSubmit = () => {
      if(isFormValid(fields)) {
        clientRequest(fields);
        onSubmit(fieldsToObject(fields));
      }
    }

  </script>
  
  <style>
    :global(input, select) {
      margin: 5px;
    }
  </style>
  

  {#if !submitted }
    <form on:submit|preventDefault={() => handleSubmit()}>
        {#each fields as field}
            {#if field.type === 'Input'}
              <div class="form-group mb-3">
                <Input bind:value={field.value} label={field.label} placeholder={field.placeholder} required={field.required} formErrors={formErrors} />
              </div>
            {:else if field.type === 'Email'}
              <div class="form-group mb-3">
                <InputEmail bind:value={field.value} label={field.label} placeholder={field.placeholder} required={field.required} formErrors={formErrors}/>  
              </div>
            {/if}
        {/each}
        <button type="submit" class="btn btn-primary form-group-api-key-item">Submit</button>
    </form>
  {:else}
    <h3>Please check your email you should have received and email with an Api Key</h3>
  {/if}


  