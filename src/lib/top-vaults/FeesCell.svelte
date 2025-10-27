<script lang="ts">
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { formatPercent } from '$lib/helpers/formatters';

	interface Props {
		management_fee: MaybeNumber;
		performance_fee: MaybeNumber;
	}

	let { management_fee, performance_fee }: Props = $props();
</script>

<div class="fees">
	{#if !management_fee && !performance_fee}
		---
	{:else}
		<Tooltip>
			<div class="multiline" slot="trigger">
				{#if management_fee}
					<div>{formatPercent(management_fee, 1)}</div>
				{/if}
				{#if performance_fee}
					<div>{formatPercent(performance_fee, 1)}</div>
				{/if}
			</div>
			<dl slot="popup" class="fees-popup">
				<div>
					<dt>Management fee:</dt>
					<dd>{formatPercent(management_fee, 1)}</dd>
				</div>
				<div>
					<dt>Performance fee:</dt>
					<dd>{formatPercent(performance_fee, 1)}</dd>
				</div>
			</dl>
		</Tooltip>
	{/if}
</div>

<style>
	.fees {
		display: contents;

		:global(.popup) {
			right: 0;
		}

		dl {
			display: grid;
			gap: 0.25rem;
			white-space: nowrap;

			div {
				display: grid;
				grid-template-columns: 1fr auto;
				gap: 1rem;
			}
		}
	}
</style>
