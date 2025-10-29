<script lang="ts">
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { isNumber, formatPercent, notFilledMarker } from '$lib/helpers/formatters';

	interface Props {
		mgmt_fee: MaybeNumber;
		perf_fee: MaybeNumber;
	}

	let { mgmt_fee, perf_fee }: Props = $props();
</script>

<div class="fees">
	<Tooltip>
		<div class="multiline" slot="trigger">
			{#if !isNumber(mgmt_fee) && !isNumber(perf_fee)}
				{notFilledMarker}
			{:else if mgmt_fee === 0 && perf_fee === 0}
				0.0%
			{:else}
				<div>{formatPercent(mgmt_fee, 1)}</div>
				<div>{formatPercent(perf_fee, 1)}</div>
			{/if}
		</div>
		<dl slot="popup" class="fees-popup">
			<div>
				<dt>Management fee:</dt>
				<dd>{isNumber(mgmt_fee) ? formatPercent(mgmt_fee, 1) : 'unknown'}</dd>
			</div>
			<div>
				<dt>Performance fee:</dt>
				<dd>{isNumber(perf_fee) ? formatPercent(perf_fee, 1) : 'unknown'}</dd>
			</div>
		</dl>
	</Tooltip>
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
