<script lang="ts">
	import { backendUrl } from '$lib/config';
	import { Alert, Button, TextInput } from '$lib/components';
	import Spinner from 'svelte-spinner';

	const url = `${backendUrl}/register`;

	let submitting = false;
	let success = false;
	let error: string | undefined = undefined;

	let email = '';
	let firstName = '';
	let lastName = '';

	$: disabled = submitting || success;

	async function handleSubmit() {
		submitting = true;
		error = undefined;

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
	<header class="ds-container">
		<h1>Sign up for free DEX data API key</h1>
		<p>
			Sign up for Trading Strategy's newsletter to get a free API key to
			<a class="body-link" href="/trading-view/backtesting">access historical and backtesting DEX datasets.</a>
		</p>
	</header>

	<section class="ds-container">
		<form on:submit|preventDefault={handleSubmit}>
			{#if error}
				<Alert status="error">{error}</Alert>
			{:else if success}
				<Alert status="success">Check your email for futher instructions.</Alert>
			{/if}

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
		</form>
	</section>
</main>

<style lang="postcss">
	main {
		--container-max-width: 600px;
		display: grid;
		gap: var(--space-5xl);
	}

	header {
		h1 {
			margin-block: var(--space-5xl) var(--space-md);
			font: var(--f-heading-xl-medium);
			letter-spacing: var(--f-heading-xl-spacing, normal);

			@media (--viewport-sm-down) {
				font: var(--f-heading-lg-medium);
				letter-spacing: var(--f-heading-lg-spacing, normal);
			}
		}

		p {
			font: var(--f-ui-lg-roman);
			letter-spacing: var(--f-ui-lg-spacing, normal);
		}
	}

	form {
		display: grid;
		gap: var(--space-xl);
	}
</style>
