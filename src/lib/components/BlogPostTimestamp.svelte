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
		font: var(--timestamp-font, var(--f-ui-lg-roman));
		color: var(--c-text-2-v1);
	}
</style>
