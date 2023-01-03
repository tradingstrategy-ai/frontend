<!--
@component
Display a date/time value. The `date` prop can be provided as a JS Date, JS timestamp or parsable
date string. Alternatively, the `epoch` prop can be used for UNIX epoch timestamps.

#### Usage:
```tsx
  <DateTime date="2022-12-10T06:00Z" relative />
  <DateTime epoch={1670652000} withSeconds />
```
-->
<script lang="ts">
	import { fromUnixTime, formatDistanceToNow } from 'date-fns';

	export let date: number | string | Date | undefined = undefined;
	export let epoch: number | undefined = undefined;
	export let relative = false;
	export let withSeconds = false;

	const dateTime = date ? new Date(date) : epoch ? fromUnixTime(epoch) : null;
</script>

{#if dateTime?.valueOf()}
	{@const isoDate = dateTime.toISOString()}
	<time class="date-time" datetime={isoDate} title={relative ? isoDate : undefined}>
		{#if relative}
			{formatDistanceToNow(dateTime, { addSuffix: true })};
		{:else}
			<span>{isoDate.slice(0, 10)}</span>
			<span>{isoDate.slice(11, withSeconds ? 19 : 16)}</span>
		{/if}
	</time>
{:else}
	---
{/if}

<style lang="postcss">
	span {
		white-space: pre;
	}
</style>
