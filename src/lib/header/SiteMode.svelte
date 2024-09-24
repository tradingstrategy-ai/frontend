<!--
@component
A helpful widget to identify non-production deployment and give some developer diagnostics.

#### Usage:
```tsx
	<SiteMode />
```
-->
<script lang="ts">
	import { backendUrl, siteMode } from '$lib/config';
</script>

{#if siteMode !== 'production'}
	<section class="site-mode ds-container">
		<p>
			Frontend running in <strong>{siteMode}</strong> mode, backend is
			<strong>{backendUrl}</strong>.
		</p>

		<p>
			<a class="body-link" href="/diagnostics">Diagnostics page</a> |
			<a class="body-link" href="/slow-load">Slow page</a> |
			<a class="body-link" href="/sentry-test">Sentry test page</a>
		</p>
	</section>
{/if}

<style>
	.site-mode {
		padding-block: var(--space-md);
		gap: var(--space-md);
		background: blue;
		color: white;
		text-align: center;
	}
</style>
