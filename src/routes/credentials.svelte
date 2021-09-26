<!-- src/App.svelte -->
<script>
    import Form from "../components/form/Form.svelte";
  
    //   Our field representation, let's us easily specify several inputs
    let fields = [
      {
        name: "email",
        type: "Email",
        value: "",
        placeholder: "Enter email...",
        label: "Email",
        required: true
      },
      {
        name: "firstName",
        type: "Input",
        value: "",
        placeholder: "Enter first name...",
        label: "First name",
        required: true
      },
      {
        name: "lastName",
        type: "Input",
        value: "",
        placeholder: "Enter last name...",
        label: "Last name",
        required: true
      },
    ];
  
    let result = {};
  </script>

  <div class="container">
    <div class="row">
        <div class="col-8">
            <div class="card bg-primary shadow-soft border-light px-4 py-5">
                <h1>Request your Api Key</h1>
                <Form
                    onSubmit={(body) => {
                      result = body;
                    }}
                {fields} />      
            </div>
        </div>
    </div>
  </div>
