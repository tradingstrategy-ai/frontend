<script lang="ts">
	import { formatDistanceToNow } from 'date-fns';

	export let publishedAt: string;
	const publishedDate = new Date(publishedAt);
</script>

<time datetime={publishedAt}>
	{publishedDate.toDateString()},
	{formatDistanceToNow(publishedDate, { addSuffix: true })}
</time>

<style>
	time {
		font: var(--timestamp-font, 400 var(--fs-ui-lg));
		color: var(--c-text-2);
	}
</style>
