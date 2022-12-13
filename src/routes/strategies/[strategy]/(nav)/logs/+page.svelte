<!--
	Page to display trade exeuctor logs with log level filter.
-->
<script lang="ts">
	import type { PageData } from './$types';
	import LogMessageList from './LogMessageList.svelte';

	export let data: PageData;

	let level: 'trade' | 'info' = 'trade';

	$: logs = data.logs.filter((entry) => !(level === 'trade' && entry.level === 'info'));
</script>

<section style:overflow="auto">
	<div class="level-picker">
		<h3>Log level:</h3>
		{#each ['trade', 'info'] as option}
			<label>
				<input type="radio" bind:group={level} name="level" value={option} checked={option === level} />
				{option}
			</label>
		{/each}
	</div>

	<LogMessageList {logs} />
</section>

<style lang="postcss">
	.level-picker {
		display: flex;
		gap: 1rem;

		& h3 {
			font: var(--f-ui-md-bold);
			letter-spacing: var(--f-ui-md-spacing, normal);
		}

		& label {
			display: flex;
			gap: 0.25rem;
			font: var(--f-ui-md-medium);
			letter-spacing: var(--f-ui-md-spacing, normal);
		}
	}
</style>
