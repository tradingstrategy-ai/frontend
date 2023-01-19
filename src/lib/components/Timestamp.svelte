<!---
@component
Render a `<time>` element with `datestamp` value and formated date/time content. The `date` value
can be a unix epoch timestamp, JS-style timestamp, ISO string (or other string that is parsable
by JS Date) or a Date object.

#### Usage:
```tsx
	<Timestamp date={1672531200} format="iso" withTime />
	<Timestamp date="2023-01-01T00:00Z" withRelative />
```
-->
<script lang="ts">
	import { formatDistanceToNow } from 'date-fns';

	type MaybeDate = Date | string | number | undefined | null;
	export let date: MaybeDate;
	export let format: 'default' | 'relative' | 'iso' | 'ISO' = 'default';
	export let withRelative = false;
	export let withTime = false;
	export let withSeconds = false;

	$: parsedDate = parse(date);
	$: isoString = parsedDate?.toISOString();

	function parse(value: MaybeDate) {
		if (value instanceof Date) return value;
		if (value === null || value === undefined) return undefined;

		// numeric values (may come from server as string type)
		let numVal = Number(value);
		if (Number.isFinite(numVal)) return parseNumeric(numVal);

		// string values
		if (typeof value === 'string') return parseString(value);
	}

	function parseNumeric(value: number) {
		// heuristic to determine is this is a Unix epoch value (no ms)
		if (value < 10_000_000_000) value *= 1000;
		return new Date(value);
	}

	function parseString(value: string) {
		// only return valid parsed dates
		const parsedDate = new Date(value);
		return Number.isFinite(parsedDate.valueOf()) ? parsedDate : undefined;
	}

	function getDefaultDateString(d: Date, withRelative = false) {
		const parts = [d.toDateString()];
		if (withRelative) parts.push(getRelativeDateString(d));
		return parts.join(', ');
	}

	function getRelativeDateString(d: Date) {
		return formatDistanceToNow(d, { addSuffix: true });
	}

	function getISODateString(isoStr: string = '') {
		return isoStr.slice(0, 10);
	}

	function getISOTimeString(isoStr: string = '', withSec = false) {
		return isoStr.slice(11, withSec ? 19 : 16);
	}
</script>

{#if parsedDate}
	<time datetime={isoString}>
		{#if format === 'default'}
			{getDefaultDateString(parsedDate, withRelative)}
		{:else if format === 'relative'}
			{getRelativeDateString(parsedDate)}
		{:else if format.toLowerCase() === 'iso'}
			<span>{getISODateString(isoString)}</span>
			{#if withTime || withSeconds}
				<span>{getISOTimeString(isoString, withSeconds)}</span>
			{/if}
		{/if}
	</time>
{:else}
	<slot>---</slot>
{/if}

<style lang="postcss">
	span {
		white-space: pre;
	}
</style>
