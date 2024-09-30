<!--
@component
Display a loading spinner

@example

```svelte
  <Spinner size="60" color="var(--c-text-ultra-light)" />
```
-->

<script>
	export let size = '30';
	export let color = 'var(--c-text-extra-light)';
</script>

<svg viewBox="0 0 32 32" height={size} width={size} class="spinner" xmlns="http://www.w3.org/2000/svg">
	<circle
		cx="16"
		cy="16"
		r="10"
		fill="none"
		stroke={color}
		stroke-width="2.5"
		stroke-dasharray="40"
		stroke-linecap="round"
	/>
</svg>

<style>
	.spinner {
		circle {
			transform-origin: center;
			animation: spin 1.25s linear infinite;
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
