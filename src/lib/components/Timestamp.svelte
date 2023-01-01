<script lang="ts">
	import { formatDatetime } from '$lib/helpers/formatters';
	import { formatDistanceToNow } from 'date-fns';
	formatDatetime;

	export let datetime = new Date();
	export let showDistanceToNow = false;
</script>

<time datetime={formatDatetime(datetime)}>
	{datetime.toDateString()}
	{#if showDistanceToNow}
		,
		{formatDistanceToNow(datetime, { addSuffix: true })}
	{/if}
</time>
