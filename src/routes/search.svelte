<script lang="ts">
  let value="";
</script>

<svelte:head>
    <title>Search</title>
    <meta name="description" content="Search Trading Entities">
</svelte:head>

<main>
    <section>
        <div class="container">
            <div class="row">
                <div class="col-md-3">
                    <h1>Search</h1>
                </div>
                <div class="col-md-9 col-sm-12 d-flex align-items-center">
                    <input
                      type="search"
                      data-cy="search"
                      placeholder="search"
                      autocapitalize="none"
                      spellcheck="false"
                      bind:value
                    />
                </div>
            </div>

            <div class="row">
              <div class="col-md-3">
                  <h2>Filters</h2>
              </div>
              <div class="col-md-9 col-sm-12">
                <h2>Search Results</h2>
              </div>
            </div>
        </div>
    </section>
</main>

<style>
  input {
    flex: 1;
    height: 40px;
    width: 100%;
    max-width: 500px;
    padding: 0 1ex 0 2em;
    border: 2px solid #44476a;
    border-radius: 20px;
    outline: none;
    background: rgba(255, 255, 255, 0.5) url("/images/search.svg") 1ex 55%/16px no-repeat;
    font-size: 1rem;
    color: #44476a;
  }

  input:focus {
    background-color: rgba(255, 255, 255, 0.75);
    box-shadow: 0 0 10px #44476a55;
  }

  input::placeholder {
    color: #44476a80;
  }
</style>
