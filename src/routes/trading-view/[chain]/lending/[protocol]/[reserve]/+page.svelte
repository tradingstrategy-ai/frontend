<script lang="ts">
	import type { PageData } from './$types';
	import { Section } from '$lib/components';

	export let data: PageData;
</script>

<Section padding="md">
	<h2>Reserve details page (coming soon)</h2>
	<pre>{JSON.stringify(data, null, 4)}</pre>
</Section>

<style lang="postcss">
	pre {
		padding: var(--space-lg);
		background: var(--c-background-7);
		border-radius: var(--radius-md);
		color: var(--c-text-default-night);
		font: var(--f-mono-md-regular);
		letter-spacing: var(--f-mono-md-spacing, normal);
	}
</style>
