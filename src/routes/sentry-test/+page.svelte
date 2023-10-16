<script lang="ts">
	import { Alert, Button, ContentCard, Grid, Section } from '$lib/components';

	let hasClientError = false;

	async function testClientError() {
		hasClientError = true;
		throw new Error('Sentry test error - client');
	}
</script>

<svelte:head>
	<title>Developer Sentry test page</title>
	<meta name="description" content="Generate test errors to validate Sentry integration" />
</svelte:head>

<Section padding="sm" gap="sm">
	<h2>Sentry test page</h2>
	<p>
		This page is for Trading Strategy developers to test our Sentry integration. View issues on the <a
			class="body-link"
			href="https://sentry.tradingstrategy.ai/organizations/tradingstrategy/issues/?project=3">Sentry issues page</a
		>. For more information, take a look at the
		<a class="body-link" href="https://docs.sentry.io/platforms/javascript/guides/sveltekit/"
			>Sentry SvelteKit Documentation</a
		>.
	</p>

	<Grid cols={2} gap="lg">
		<ContentCard
			title="Server error"
			description="Generate a test node.js server-side rendering error."
			ctaLabel="Test server error"
			href="/sentry-test?server"
		/>

		<ContentCard
			title="Client error"
			description="Generate a test client-side (browser) error."
			ctaLabel="Test client error"
			href="/sentry-test"
			on:click={testClientError}
		/>
	</Grid>

	{#if hasClientError}
		<Alert status="warning" title="Sentry test error">
			A client-side JavaScript error was generated.
			<Button
				slot="cta"
				size="sm"
				label="View Sentry issues"
				href="https://sentry.tradingstrategy.ai/organizations/tradingstrategy/issues/?project=3"
			/>
		</Alert>
	{/if}
</Section>
