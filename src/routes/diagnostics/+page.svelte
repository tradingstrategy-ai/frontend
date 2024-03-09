<!--
A test endpoint for the page to show debug data.
-->
<script lang="ts">
	import * as config from '$lib/config';
	import { env } from '$env/dynamic/public';
	import { Alert, Button, TextInput } from '$lib/components';
	import { isGeoBlocked } from '$lib/helpers/geo.js';

	export let data;
	const { admin, ipCountry, requestHeaders } = data;

	const geoBlocked: Record<string, 'blocked' | 'allowed'> = {};
	for (const feature in config.geoBlock) {
		geoBlocked[feature] = isGeoBlocked(feature, ipCountry) ? 'blocked' : 'allowed';
	}
</script>

<section class="ds-container">
	<h1>Developer diagnostics page</h1>

	<div>
		<h2>Admin Role</h2>
		<div class="admin" class:has-admin={admin}>
			{#if admin}
				<Alert size="xs" status="success">You have <strong>admin</strong> role.</Alert>
				<form data-sveltekit-reload>
					<input type="hidden" name="pw" value="" />
					<Button size="sm" label="Clear" />
				</form>
			{:else}
				<Alert size="xs">You do not have <strong>admin</strong> role.</Alert>
				<form data-sveltekit-reload>
					<TextInput type="password" name="pw" placeholder="Enter admin pw" />
					<Button size="sm" label="Save" />
				</form>
			{/if}
		</div>
	</div>

	<div>
		<h2>Public environment variables</h2>
		<pre class="terminal-viewport">{JSON.stringify(env, null, 4)}</pre>
	</div>

	<div>
		<h2>Config</h2>
		<pre class="terminal-viewport">{JSON.stringify(config, null, 4)}</pre>
	</div>

	<div>
		<h2>Geo-blocked features</h2>
		<pre class="terminal-viewport">{JSON.stringify({ ipCountry, ...geoBlocked }, null, 4)}</pre>
	</div>

	<div>
		<h2>Request headers</h2>
		<pre class="terminal-viewport">{JSON.stringify(requestHeaders, null, 4)}</pre>
	</div>
</section>

<style>
	h1 {
		padding-block: var(--space-md);
		font: var(--f-heading-xxl-medium);
		letter-spacing: var(--f-heading-xxl-spacing, normal);

		@media (--viewport-sm-down) {
			padding-block: var(--space-sm);
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);
		}
	}

	h2 {
		padding-block: var(--space-sm);
		font: var(--f-heading-md-medium);
		letter-spacing: var(--f-heading-md-spacing, normal);

		@media (--viewport-sm-down) {
			padding-block: var(--space-xs);
			font: var(--f-heading-sm-medium);
			letter-spacing: var(--f-heading-sm-spacing, normal);
		}
	}

	section {
		--container-max-width: 1020px;
		gap: var(--space-lg);
	}

	.admin {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 1rem;
		align-items: center;

		&:not(.has-admin) {
			@media (--viewport-sm-down) {
				grid-template-columns: auto;
			}
		}

		form {
			display: grid;
			grid-auto-flow: column;
			gap: 0.5rem;
			align-items: center;
		}
	}

	pre {
		white-space: pre-wrap;
		word-break: break-all;
	}
</style>
