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

	const siteBar = siteMode !== 'production';
</script>

{#if siteBar}
	<div class="site-mode text-center">
		<p>
			Frontend running in <strong>{siteMode}</strong> mode, backend is
			<strong>{backendUrl}</strong>.
		</p>

		<p>
			<a href="/slow-load">Go to slow page</a> | <a href="/diagnostics">Go to diagnostics page</a>
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
