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

<style lang="postcss">
	div {
		display: flex;
		font: var(--f-ui-body-medium);
	}

	a {
		flex: 1;
		padding: var(--space-ss) min(var(--space-lg), 2vw);
		border: 2px solid var(--c-border-2-v1);
		font-weight: 500;
		color: var(--c-text-3-v1);
		text-align: center;

		@media (--viewport-md-up) {
		}

		&:not(:first-child) {
			border-left-width: 1px;
		}

		&:not(:last-child) {
			border-right-width: 1px;
		}

		&:hover,
		&.active {
			background: var(--c-background-3-v1);
			color: var(--c-text-6-v1);
		}
	}
</style>
