<script>
	import { backendUrl } from '$lib/config';
	import Spinner from 'svelte-spinner';

    const url = `${backendUrl}/register`;

    let submitting = false;
    let success = false;
    let error = null;

    let email = "";
    let firstName = "";
    let lastName = "";

    $: disabled = submitting || success;

    async function handleSubmit() {
        submitting = true;
        error = null;

		// Avoid whitespace issues
        const params = new URLSearchParams({
            email: email.trim(),
            first_name: firstName.trim(),
            last_name: lastName.trim()
        });

		try {
			const res = await fetch(url, {
				method: 'POST',
				body: params
			});

			const data = await res.json();
			if (!data.valid) {
                error = data.error;
				return;
			}

            success = true;
		} catch (e) {
           error = e.message;
        } finally {
		   submitting = false;
		}
	}
</script>

<svelte:head>
	<title>API key request form</title>
	<meta name="description" content="About Trading Strategy Protocol" />
</svelte:head>

<main>
	<section>
		<div class="container">
			<div class="row  mt-5">
				<div class="col-md-12">
					<h1>API generator form</h1>

					<div class="lead">
						<p>Register an API key for Trading Strategy dataset download</p>
					</div>
				</div>
			</div>

            <div class="row audience">
                <div class="col-md-8 text-center align-center">
                    <form id="form-registration" class="form-group" on:submit|preventDefault={handleSubmit}>

                        {#if error}
                            <div class="alert alert-danger">
                                {error}
                            </div>
                        {:else if success}
                            <div class="alert alert-info">
                                Check your email – your keys have been sent properly.
                            </div>
                        {:else}
                            <div class="instructions">
                                Please register to receive an API Key in your email inbox.
                            </div>
                        {/if}

                        <div id="form-group-registration">
                            <input
                                bind:value={email}
                                class="form-control form-group-registration-item mb-4"
                                type="email"
                                placeholder="email"
                                required
                                {disabled}
                            />

                            <input
                                bind:value={firstName}
                                class="form-control form-group-registration-item mb-4"
                                type="text"
                                placeholder="first name"
                                spellcheck="false"
                                required
                                {disabled}
                            />

                            <input
                                bind:value={lastName}
                                class="form-control form-group-registration-item mb-4"
                                type="text"
                                placeholder="last name"
                                spellcheck="false"
                                required
                                {disabled}
                            />

                            <button
                                type="submit"
                                class="btn btn-primary form-group-api-key-item mb-4"
                                class:submitting
                                {disabled}
                            >
                                {#if submitting}
                                    Submitting <Spinner />
                                {:else}
                                    Generate Key
                                {/if}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
		</div>
	</section>
</main>

<style>
    .instructions {
        padding: 1rem;
        margin-bottom: 1rem;
        border: 1px solid transparent;
        font-size: 0.875rem;
    }

    button[disabled] {
        height: 2.8rem;
        cursor: not-allowed;
        background: #cccccc;
        border: 2px solid #888888;
        opacity: 0.25;
	}

    button.submitting {
        opacity: 0.5;
    }

    #form-group-registration {
		display: flex;
        flex-direction: column;
	}
</style>
