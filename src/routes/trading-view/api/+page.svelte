<script lang="ts">
	import { backendUrl } from '$lib/config';
	import { TextInput, Button } from '$lib/components';
	import Spinner from 'svelte-spinner';

	const url = `${backendUrl}/register`;

	let submitting = false;
	let success = false;
	let error = null;

	let email = '';
	let firstName = '';
	let lastName = '';

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
			console.log('Data', data);

			if (data.status == 'OK') {
				console.log('Registered');
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
								Sign up for Trading Strategy's newsletter to get a free API key to
								<a class="body-link" href="/trading-view/backtesting">access historical and backtesting DEX datasets.</a
								>
							</p>
						</div>

						<form id="form-registration" class="form-group" on:submit|preventDefault={handleSubmit}>
							{#if error}
								<div class="alert error">
									{error}
								</div>
							{:else if success}
								<div class="alert">Check your email for futher instructions.</div>
							{:else}
								<div class="instructions" />
							{/if}

							<div id="form-group-registration">
								<TextInput bind:value={email} size="lg" type="email" placeholder="email" required {disabled} />

								<TextInput
									bind:value={firstName}
									size="lg"
									type="text"
									placeholder="first name"
									spellcheck="false"
									required
									{disabled}
								/>

								<TextInput
									bind:value={lastName}
									size="lg"
									type="text"
									placeholder="last name"
									spellcheck="false"
									required
									{disabled}
								/>

								<Button submit {disabled}>
									{#if submitting}
										Submitting
										<Spinner color="var(--c-text-6-v1)" />
									{:else}
										Sign up
									{/if}
								</Button>
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
		padding: var(--space-md);
		margin-bottom: var(--space-md);
		border: 1px solid transparent;
		font-size: 0.875rem;
	}

	.alert {
		border-color: var(--c-border-1-v1);
	}

	.error {
		color: var(--c-bearish);
	}

	#form-group-registration {
		display: grid;
		gap: var(--space-xl);
	}
</style>
