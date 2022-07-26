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
