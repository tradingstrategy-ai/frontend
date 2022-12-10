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
	export let epoch: number = 0;
	export let relative = false;
	export let withSeconds = false;

	const dateTime = date ? new Date(date) : fromUnixTime(epoch);
	const isoDate = dateTime.toISOString();
</script>

<time datetime={isoDate} title={relative ? isoDate : undefined}>
	{#if relative}
		{formatDistanceToNow(dateTime, { addSuffix: true })};
	{:else}
		<span>{isoDate.slice(0, 10)}</span>
		<span>{isoDate.slice(11, withSeconds ? 19 : 16)}</span>
	{/if}
</time>

<style lang="postcss">
	span {
		white-space: pre;
	}
</style>
