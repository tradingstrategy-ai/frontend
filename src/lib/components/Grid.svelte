<!--
@component
Utility component for grid-based layouts

@example

```svelte
	<Grid cols={3} gap="lg">
		your nested grid elements here
	</Grid>
```
-->
<script lang="ts">
	import type { SectionSizing } from '$lib/types';

	export let cols = 1;
	export let gap: SectionSizing = '';

	$: gridGap = gap ? `var(--space-${gap}, initial)` : null;
</script>

<div class="grid cols-{cols}" style:--grid-gap={gridGap}>
	<slot />
</div>

<style>
	.grid {
		display: grid;
		gap: var(--grid-gap);
	}

	.cols-2 {
		@media (--viewport-md-up) {
			grid-template-columns: 1fr 1fr;
		}
	}

	.cols-3 {
		@media (--viewport-lg-up) {
			grid-template-columns: 1fr 1fr 1fr;
		}
	}

	.cols-4 {
		@media (--viewport-lg-up) {
			grid-template-columns: 1fr 1fr;
		}
		@media (--viewport-xl-up) {
			grid-template-columns: 1fr 1fr 1fr 1fr;
		}
	}
</style>
