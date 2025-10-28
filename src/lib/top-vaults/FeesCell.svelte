<script lang="ts">
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { formatPercent } from '$lib/helpers/formatters';

	interface Props {
		mgmt_fee: MaybeNumber;
		perf_fee: MaybeNumber;
	}

	let { mgmt_fee, perf_fee }: Props = $props();
</script>

<div class="fees">
	{#if !mgmt_fee && !perf_fee}
		---
	{:else}
		<Tooltip>
			<div class="multiline" slot="trigger">
				{#if mgmt_fee}
					<div>{formatPercent(mgmt_fee, 1)}</div>
				{/if}
				{#if perf_fee}
					<div>{formatPercent(perf_fee, 1)}</div>
				{/if}
			</div>
			<dl slot="popup" class="fees-popup">
				<div>
					<dt>Management fee:</dt>
					<dd>{formatPercent(mgmt_fee, 1)}</dd>
				</div>
				<div>
					<dt>Performance fee:</dt>
					<dd>{formatPercent(perf_fee, 1)}</dd>
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
