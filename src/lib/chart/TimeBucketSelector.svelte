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
		box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.25), -3px -3px 6px rgba(0, 0, 0, 0.25);
		font-size: 0.875rem;
	}

	a {
		padding: 0.4em 1em;
		font-weight: 500;
		border-left: 1px solid var(--light);
	}

	a:first-child {
		border-left: none;
		border-radius: 0.5rem 0 0 0.5rem;
	}

	a:last-child {
		border-radius: 0 0.5rem 0.5rem 0;
	}

	a:hover {
		background-color: rgba(0, 0, 0, 0.25);
	}

	.active,
	.active:hover {
		background-color: rgba(0, 0, 0, 0.5);
		color: white;
		cursor: default;
	}

	@media (max-width: 576px) {
		div {
			font-size: 0.75rem;
		}
	}
</style>
