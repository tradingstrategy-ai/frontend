<!--
@component
Used for selecting a time bucket for chart data feeds.default

#### Usage:
```tsx
  <TimeBucketSelector active="4h" />
```
-->
<script lang="ts">
	export let active: string;
	const buckets = ['1m', '5m', '15m', '1h', '4h', '1d', '7d', '30d'];
</script>

<div>
	{#each buckets as bucket}
		<a href="#{bucket}" class:active={bucket === active}>
			{bucket}
		</a>
	{/each}
</div>

<style>
	div {
		display: flex;
		margin-bottom: 0.5em;
		border: 1px solid var(--light);
		border-radius: 0.55rem;
		box-shadow: 3px 3px 6px var(--light), -3px -3px 6px var(--light);
		font-size: 0.875rem;
	}

	a {
		padding: 0.4em 1em;
		font-weight: 500;
		border-left: 1px solid var(--light);
	}

	a:hover {
		background-color: var(--light);
	}

	.active,
	.active:hover {
		background-color: var(--secondary);
		color: white;
		cursor: default;
	}

	@media (max-width: 576px) {
		div {
			font-size: 0.75rem;
		}
	}
</style>
