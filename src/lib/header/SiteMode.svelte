<script context="module">
	/**
	 * A helpful widget to identify non-production deployment and give some developer diagnostics.
	 */
	import { siteMode, backendUrl } from '$lib/config';

	const siteBar = siteMode == 'local' || siteMode == 'staging';
</script>

{#if siteBar}
	<div class="site-mode text-center">
		<p>
			Frontend running in <strong>{siteMode}</strong> mode, backend is
			<strong>{backendUrl}</strong>.
		</p>

		<p>
			<a href="/slow-load">Go to slow page</a>
		</p>
	</div>
{/if}

<style>
	.site-mode {
		padding: 10px;
		background: blue;
		color: white;
	}

	.site-mode a {
		color: white;
	}
</style>
