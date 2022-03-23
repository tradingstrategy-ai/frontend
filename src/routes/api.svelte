<script>
	import { backendUrl } from '$lib/config';
	import Spinner from 'svelte-spinner';

    const url = `${backendUrl}/register`;

    let submitting = false;
    let submitted = false;
    let apiRegistrationError = null;

    let email = "";
    let firstName = "";
    let lastName = "";

    async function handleSubmit() {
        submitting = true;
        apiRegistrationError = null;

		// Avoid whitespace issues
        const params = new URLSearchParams({
            email: email.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim()
        });

		try {
			const res = await fetch(url, {
				method: 'POST',
				body: params
			});

			const data = await res.json();
			if (!data.valid) {
                apiRegistrationError = data.error;
				return;
			}

            submitted = true;
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
					<h1>API generator form</h1>

					<div class="lead">
						<p>Register an API key for Trading Strategy dataset download</p>
					</div>
				</div>
			</div>

            <div class="row audience">
                <div class="col-md-8 text-center align-center">
                    <form id="form-registration" class="form-group" on:submit|preventDefault={handleSubmit}>

                        {#if apiRegistrationError}
                            <div class="alert alert-danger">
                                {apiRegistrationError}
                            </div>
                        {:else if submitted}
                            <label for="apiKeyInfo" class="alert alert-info">Check your email your keys have been sent properly.</label>
                        {:else}
                            <label for="apiKey">Please register to receive an apikey in your email inbox.</label>
                        {/if}

                        <div id="form-group-registration">
                            <input
                                bind:value={email}
                                class="form-control form-group-registration-item mb-4"
                                id="email"
                                placeholder="email"
                                type="text"
                            />

                            <input
                                bind:value={firstName}
                                class="form-control form-group-registration-item mb-4"
                                id="firstName"
                                placeholder="first name"
                                type="text"
                            />

                            <input
                                bind:value={lastName}
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
		</div>
	</section>
</main>

<style>
	h1 {
		margin: 30px 0;
	}

	.questions,

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
