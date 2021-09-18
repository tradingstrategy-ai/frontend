<!-- src/App.svelte -->
<script>
    import Form from "../lib/form/Form.svelte";
  
    //   Our field representation, let's us easily specify several inputs
    let fields = [
      {
        name: "email",
        type: "Email",
        value: "",
        placeholder: "Enter email...",
        label: "Email",
      },
      {
        name: "firstName",
        type: "Input",
        value: "",
        placeholder: "Enter first name...",
        label: "First name",
      },
      {
        name: "lastName",
        type: "Input",
        value: "",
        placeholder: "Enter last name...",
        label: "Last name",
      },
    ];
  
    let result = {};
  </script>

  <div class="container">
    <Form
        onSubmit={(body) => {
          result = body;
        }}
    {fields} />      
  </div>

  <!-- Show the current state of our Form
  <pre><code>{JSON.stringify(result, 0, 2)}</code></pre> -->