<script lang="ts">
	import Timestamp from '$lib/components/Timestamp.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';

	interface Props {
		last_deposit: string;
	}

	let { last_deposit }: Props = $props();
</script>

<div class="last-deposit">
	<Tooltip>
		<Timestamp slot="trigger" date={last_deposit} relative={{ strict: true, unit: 'day' }}>
			{#snippet children({ relativeStr })}
				{relativeStr.replace(' days', 'd')}
			{/snippet}
		</Timestamp>
		<span slot="popup">
			{last_deposit.replace('T', ' ')} UTC
		</span>
	</Tooltip>
</div>

<style>
	.last-deposit {
		display: contents;

		:global(.popup) {
			white-space: nowrap;
			left: -100%;
		}
	}
</style>
