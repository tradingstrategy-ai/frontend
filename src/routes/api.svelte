<script context="module">
	import { backendUrl } from '$lib/config';
</script>

<script>
	import Spinner from 'svelte-spinner';

    export let submitting = false;
	export let submitted = false;
    export let apiRegistrationError = null;

	async function handleSubmit(event) {
		const url = `${backendUrl}/register`;
		let email = event.target.email.value;
		let firstName = event.target.firstName.value;
		let lastName = event.target.lastName.value;

		// Avoid whitespace issues
		email = email.trim();
		firstName = firstName.trim();
		lastName = lastName.trim();

		submitting = true;

        const params =  {
            email,
            first_name: firstName,
            last_name: lastName
        }

        const encoded = new URLSearchParams(params)

		try {
			const res = await fetch(url, {
				method: 'POST',
				body: encoded
			});

			const data = await res.json();
			if (!data.valid) {
                apiRegistrationError = data.error;
				return;
			}

		} catch (e) {
           apiRegistrationError = e.message;
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
			<div class="row">
				<div class="col-md-12">
					<h1>API key</h1>

					<div class="lead">
						<p>Register an API key for Trading Strategy dataset download</p>
					</div>
				</div>
			</div>

            {#if !submitted}
                <div class="row audience">
                    <div class="col-md-8 text-center align-center">
                        <h2>API key generator form</h2>
                        <form id="form-registration" class="form-group" on:submit|preventDefault={handleSubmit}>

                            {#if apiRegistrationError}
                                <div class="alert alert-danger">
                                    {apiRegistrationError}
                                </div>
                            {:else}
                                <label for="apiKey">Please register to receive an apikey in your email inbox.</label>
                            {/if}

                            <div id="form-group-registration">
                                <input
                                    class="form-control form-group-registration-item mb-4"
                                    id="email"
                                    placeholder="email"
                                    type="text"
                                />

                                <input
                                    class="form-control form-group-registration-item mb-4"
                                    id="firstName"
                                    placeholder="first name"
                                    type="text"
                                />

                                <input
                                    class="form-control form-group-registration-item mb-4"
                                    id="lastName"
                                    placeholder="last name"
                                    type="text"
                                />

                                <button
                                    type="submit"
                                    class="btn btn-primary form-group-api-key-item mb-4"
                                    disabled={submitting}>Enter</button
                                >

                                {#if submitting}
                                    <Spinner />
                                {/if}
                            </div>
                        </form>
                    </div>
                </div>
            {/if}
		</div>
	</section>
</main>

<style>
	h1 {
		margin: 30px 0;
	}

	.questions,
	.audience {
		margin: 60px 0;
	}

	svg {
		width: 92px;
		display: block;
		margin: 0 auto 20px auto;
	}

	.btn[disabled] {
		cursor: not-allowed;
	}

    #form-group-registration {
		display: flex;
        flex-direction: column;
	}
</style>
