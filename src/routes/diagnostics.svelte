<!--
A test endpoint for the page to show debug data.
-->
<script context="module" lang="ts">
	export async function load({ session }) {
		const config = session.config;
		return { props: { config } };
	}
</script>

<script lang="ts">
	export let config: any;

	$: configStr = JSON.stringify(config, null, 4);
</script>

<div class="container">
	<div class="content">
		<h1>Developer diagnostics page</h1>
		<h2>Config</h2>
		<pre>{configStr}</pre>
	</div>
</div>

<style>
	pre {
		padding: 1.5rem;
		background: var(--c-background-7);
		border: 2px solid var(--c-border-1);
		border-radius: 0.375rem;
		color: var(--c-parchment);
	}
</style>
