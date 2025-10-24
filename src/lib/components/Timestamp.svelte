<!---
@component
Render a `<time>` element with `datestamp` value and formated date/time content. The `date` value
can be a unix epoch timestamp, JS-style timestamp, ISO string (or other string that is parsable
by JS Date) or a Date object.

#### Basic Usage

```svelte
<Timestamp date={1672531200} withTime />
<Timestamp date={1672531200} withTime="seconds" />
<Timestamp date="2023-01-01T00:00" relative />
```

#### Relative Time Formatting

```svelte
<Timestamp date={someDate} relative />
<Timestamp date={someDate} relative={{ addSuffix: false }} />
<Timestamp date={someDate} relative={{ strict: true }} />
<Timestamp date={someDate} relative={{ strict: true, addSuffix: false }} />
```

Options:
- `relative` - simple relative time with suffix (default: "about 2 hours ago")
- `relative={{ addSuffix: false }}` - relative time without "ago" suffix ("about 2 hours")
- `relative={{ strict: true }}` - strict formatting, no approximations like "about", "over" ("2 hours ago")
- `relative={{ strict: true, addSuffix: false }}` - strict without suffix ("2 hours")

#### Custom Rendering with Snippets

```svelte
<Timestamp date={someDate}>
	{#snippet children({ parsedDate, dateStr, timeStr, relativeStr })}
		{dateStr} at {timeStr}, {relativeStr}
	{/snippet}
</Timestamp>
```
-->
<script lang="ts">
	import { formatDistanceToNow, formatDistanceToNowStrict } from 'date-fns';
	import type { FormatDistanceToNowOptions, FormatDistanceToNowStrictOptions } from 'date-fns';
	import { type MaybeParsableDate, parseDate } from '$lib/helpers/date';
	import type { Snippet } from 'svelte';

	type RelativeOptionsNonStrict = { strict?: false } & FormatDistanceToNowOptions;
	type RelativeOptionsStrict = { strict: true } & FormatDistanceToNowStrictOptions;
	type RelativeOptions = RelativeOptionsNonStrict | RelativeOptionsStrict;

	interface Props {
		date: MaybeParsableDate;
		relative?: boolean | RelativeOptions;
		withTime?: boolean | 'seconds';
		wrap?: 'none' | 'allow' | 'inner';
		children?: Snippet<[{ parsedDate: Date | undefined; dateStr: string; timeStr: string; relativeStr: string }]>;
	}

	let { date, relative = false, withTime = false, wrap = 'inner', children }: Props = $props();

	let parsedDate = $derived(parseDate(date));
	let isoStr = $derived(parsedDate?.toISOString() ?? '');
	let dateStr = $derived(isoStr.slice(0, 10));
	let timeStr = $derived(isoStr.slice(11, withTime === 'seconds' ? 19 : 16));

	let relativeOpts = $derived({
		strict: false,
		addSuffix: true,
		...(typeof relative === 'object' && relative)
	});

	let relativeStr = $derived.by(() => {
		if (!parsedDate || !relative) return '';
		return relativeOpts.strict
			? formatDistanceToNowStrict(parsedDate, relativeOpts)
			: formatDistanceToNow(parsedDate, relativeOpts);
	});
</script>

<time class="timestamp wrap-{wrap}" datetime={isoStr}>
	{#if children}
		{@render children({ parsedDate, dateStr, timeStr, relativeStr })}
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
		/* prevent whole timestamp from wrapping if wrap="none"  */
		&.wrap-none {
			white-space: nowrap;
		}
	}

	/* prevent segments from wrapping (including slot content) */
	&.wrap-inner :global(span) {
		white-space: nowrap;
	}
</style>
