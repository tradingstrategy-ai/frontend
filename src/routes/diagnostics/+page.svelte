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

	pre {
		padding: var(--space-lg);
		background: var(--c-background-7);
		border-radius: var(--radius-md);
		color: var(--c-text-default-night);
		white-space: pre-wrap;
		word-break: break-all;
	}
</style>
