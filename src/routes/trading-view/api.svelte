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
            console.log("Data", data);

            if(data.status == "OK") {
                console.log("Registered");
                success = true;
            }

			if (!data.valid) {
                error = data.error;
				return;
			}
		} catch (e) {
           error = e.message;
        } finally {
		   submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Sign up for free DEX data API key</title>
	<meta name="description" content="DeFi markets API access and data download" />
</svelte:head>

<main>
	<section>
		<div class="container">
			<div class="row  mt-5">
                    <div class="col-md-12">
                        <div class="form-wrapper">
                            <h1>Sign up for free DEX data API key</h1>

                            <div class="lead">
                                <p>
                                    Sign up for
                                    <a rel="ext" href="https://newsletter.tradingstrategy.ai">Trading Strategy
                                        newsletter</a> to get a free API key to
                                    <a href="/trading-view/backtesting">access historical and backtesting DEX
                                        datasets.</a>
                                </p>
                            </div>

                            <form id="form-registration" class="form-group" on:submit|preventDefault={handleSubmit}>

                                {#if error}
                                    <div class="alert alert-danger">
                                        {error}
                                    </div>
                                {:else if success}
                                    <div class="alert alert-info">
                                        Check your email for futher instructions.
                                    </div>
                                {:else}
                                    <div class="instructions">

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
                                            Submitting
                                            <Spinner/>
                                        {:else}
                                            Sign up
                                        {/if}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
            </div>
		</div>
	</section>
</main>

<style>

    .form-wrapper {
        margin: 0 auto;
        max-width: 600px;
    }

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
