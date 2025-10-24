<!---
@component
Render a `<time>` element with `datestamp` value and formated date/time content. The `date` value
can be a unix epoch timestamp, JS-style timestamp, ISO string (or other string that is parsable
by JS Date) or a Date object.

#### Basic Usage

```svelte
<Timestamp date={1672531200} withTime />
<Timestamp date="2023-01-01T00:00" relative />
```

#### Custom Rendering with Snippets

```svelte
<Timestamp date={someDate}>
	{#snippet children({ parsedDate, dateStr, timeStr, relative })}
		{dateStr} at {timeStr}, {relative}
	{/snippet}
</Timestamp>
```
-->
<script lang="ts">
	import { formatDistanceToNow } from 'date-fns';
	import { type MaybeParsableDate, parseDate } from '$lib/helpers/date';
	import type { Snippet } from 'svelte';

	interface Props {
		date: MaybeParsableDate;
		relative?: boolean;
		withSeconds?: boolean;
		withTime?: boolean;
		nowrap?: boolean;
		children?: Snippet<[{ parsedDate: Date | undefined; dateStr: string; timeStr: string; relative: string }]>;
	}

	let {
		date,
		relative = false,
		withSeconds = false,
		withTime = withSeconds,
		nowrap = false,
		children
	}: Props = $props();

	let parsedDate = $derived(parseDate(date));
	let isoStr = $derived(parsedDate?.toISOString() ?? '');
	let dateStr = $derived(isoStr.slice(0, 10));
	let timeStr = $derived(isoStr.slice(11, withSeconds ? 19 : 16));
	let relativeStr = $derived(parsedDate ? formatDistanceToNow(parsedDate, { addSuffix: true }) : '');
</script>

<time class="timestamp" class:nowrap datetime={isoStr}>
	{#if children}
		{@render children({ parsedDate, dateStr, timeStr, relative: relativeStr })}
	{:else if parsedDate}
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
