<!--
A test endpoint for the page to show debug data.
-->
<script lang="ts">
	import * as config from '$lib/config';
	import { env } from '$env/dynamic/public';
</script>

<section class="ds-container">
	<h1>Developer diagnostics page</h1>

	<div>
		<h2>Public environment variables</h2>
		<pre>{JSON.stringify(env, null, 4)}</pre>
	</div>

	<div>
		<h2>Config</h2>
		<pre>{JSON.stringify(config, null, 4)}</pre>
	</div>
</section>

<style>
	section {
		--container-max-width: 1020px;
		gap: 1.5rem;
	}

	pre {
		padding: 1.5rem;
		background: var(--c-background-7);
		border: 2px solid var(--c-border-1);
		border-radius: 0.375rem;
		color: var(--c-parchment);
	}
</style>
