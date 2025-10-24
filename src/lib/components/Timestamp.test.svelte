<!--
@component
Test helper component for Timestamp snippet functionality.
Used by Timestamp.test.ts to verify snippet rendering.
-->
<script lang="ts">
	import Timestamp from './Timestamp.svelte';
	import type { MaybeParsableDate } from '$lib/helpers/date';

	interface Props {
		date: MaybeParsableDate;
		testId: string;
	}

	let { date, testId }: Props = $props();
</script>

{#if testId === 'full-snippet'}
	<Timestamp {date}>
		{#snippet children({ dateStr, timeStr, relative })}
			Date: {dateStr} Time: {timeStr} Relative: {relative}
		{/snippet}
	</Timestamp>
{:else if testId === 'partial-snippet'}
	<Timestamp {date}>
		{#snippet children({ parsedDate })}
			{parsedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
		{/snippet}
	</Timestamp>
{:else if testId === 'no-snippet'}
	<Timestamp {date} />
{/if}
