<!---
@component
Render a `<time>` element with `datestamp` value and formated date/time content. The `date` value
can be a unix epoch timestamp, JS-style timestamp, ISO string (or other string that is parsable
by JS Date) or a Date object.

@example

```svelte
	<Timestamp date={1672531200} withTime />
	<Timestamp date="2023-01-01T00:00" relative />
	<Timestamp date={someDate} let:parsedDate let:dateStr let:timeStr let:relative>
		{dateStr} at {timmeStr}, {relative}
	</Timestamp>
```
-->
<script lang="ts">
	import { formatDistanceToNow } from 'date-fns';
	import { type MaybeParsableDate, parseDate } from '$lib/helpers/date';

	export let date: MaybeParsableDate;
	export let relative = false;
	export let withSeconds = false;
	export let withTime = withSeconds;
	export let nowrap = false;

	let isoStr: string, relativeStr: string, dateStr: string, timeStr: string;

	$: parsedDate = parseDate(date);

	$: if (parsedDate) {
		isoStr = parsedDate.toISOString();
		dateStr = isoStr.slice(0, 10);
		timeStr = isoStr.slice(11, withSeconds ? 19 : 16);
		relativeStr = formatDistanceToNow(parsedDate, { addSuffix: true });
	}
</script>

<time class="timestamp" class:nowrap datetime={isoStr}>
	<slot {parsedDate} {dateStr} {timeStr} relative={relativeStr}>
		{#if parsedDate}
			{#if relative}
				<span>{relativeStr}</span>
			{:else}
				<span>{dateStr}</span>
				{#if withTime}
					<span>{timeStr}</span>
				{/if}
			{/if}
		{:else}
			---
		{/if}
	</slot>
</time>

<style>
	.timestamp {
		/* prevent segments from wrapping (including slot content) */
		:global(span) {
			white-space: nowrap;
		}

		/* prevent whole timestamp from wrapping if nowrap is set  */
		&.nowrap {
			white-space: nowrap;
		}
	}
</style>
