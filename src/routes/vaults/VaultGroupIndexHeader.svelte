<!--
@component
Shared responsive header layout for vault group index pages.

Keeps the introduction and summary pie chart side by side on desktop, then
stacks them at the large breakpoint so portrait iPads retain a readable intro.

@example

```svelte
	<VaultGroupIndexHeader>
		<div class="intro-column">...</div>
		<div class="chart-column">...</div>
	</VaultGroupIndexHeader>
```
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="vault-group-index-header">
	{@render children()}
</div>

<style>
	.vault-group-index-header {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(25rem, 40rem);
		gap: 1.5rem;
		align-items: stretch;

		:global(.intro-column) {
			display: grid;
			align-content: start;
		}

		:global(.chart-column) {
			display: grid;
		}

		:global(.chart-column .metrics-box) {
			height: 100%;
		}

		:global(.chart-column .market-share-pie-chart) {
			align-self: stretch;
		}

		@media (--viewport-md-down) {
			grid-template-columns: 1fr;
		}
	}
</style>
