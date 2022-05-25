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
		border: 1px solid #ccbeb3;
		border-radius: 0.55rem;
		box-shadow: 3px 3px 6px #ccbeb3, -3px -3px 6px #ccbeb3;
		font-size: 0.875rem;
	}

	a {
		padding: 0.4em 1em;
		font-weight: 500;
		color: rgba(0, 0, 0, 0.8);
		border-left: 1px solid #ccbeb3;
	}

	a:hover {
		color: rgba(0, 0, 0, 0.9);
		background-color: rgba(128, 222, 234, 0.8);
	}

	.active {
		font-weight: bold;
		background-color: var(--secondary);
		color: black;
	}

	@media (max-width: 576px) {
		div {
			font-size: 0.75rem;
		}
	}
</style>
