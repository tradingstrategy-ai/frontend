<script lang="ts">
	import type { ChartPairs } from 'trade-executor/schemas/chart';
	import { slide } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		selectedPairIds: number[];
		tradingPairs: ChartPairs;
		onchange?: (ids: number[]) => void;
	}

	let { selectedPairIds = $bindable(), tradingPairs, onchange }: Props = $props();

	let activePairIds = $state(selectedPairIds);

	let activePairs = $derived(
		tradingPairs.all_pairs.filter((p) => {
			return activePairIds.includes(p.internal_id!);
		})
	);

	let editing = $state(false);

	function cancel() {
		activePairIds = selectedPairIds;
		editing = false;
	}

	function save() {
		selectedPairIds = activePairIds;
		onchange?.(selectedPairIds);
		editing = false;
	}
</script>

<div class="pairs-selector">
	<label class="current-selection tile b">
		<span>Pairs: {activePairs.map((pair) => pair.symbol).join(', ')}</span>
		<Button size="xs" disabled={editing} on:click={() => (editing = true)}>Edit</Button>
	</label>

	{#if editing}
		<div class="dialog" transition:slide={{ duration: 250 }}>
			<div class="inner">
				<header>
					<h4>Select pairs</h4>
					<Button size="xs" ghost on:click={cancel}>Cancel</Button>
					<Button size="xs" on:click={save}>Save</Button>
				</header>
				<div class="pairs">
					{#each tradingPairs.all_pairs as pair (pair.internal_id)}
						<label>
							<input type="checkbox" value={pair.internal_id} bind:group={activePairIds} />
							{pair.symbol}
						</label>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.pairs-selector {
		height: 100%;

		.current-selection {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
			height: 100%;
			padding-inline: 0.75rem 0.25rem;
			border-radius: var(--radius-sl);
			cursor: pointer;
		}

		.dialog {
			position: absolute;
			inset: 3.75rem 0 0 0;
			display: grid;
			background: color-mix(in srgb, var(--c-body), hsl(var(--hsl-box)) var(--box-1-alpha));

			.inner {
				display: grid;
				gap: 0.75rem;
				padding: 1.25rem 1.5rem;
				background: color-mix(in srgb, transparent, hsl(var(--hsl-box)) var(--box-2-alpha));
				border-radius: var(--radius-sl);
				overflow: hidden;
			}

			header {
				display: grid;
				grid-template-columns: 1fr auto auto;
				gap: 0.5rem;
				align-items: center;

				h4 {
					font: var(--f-heading-xs-medium);
				}
			}

			.pairs {
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr));
				gap: 0 1rem;
				overflow-y: auto;

				label {
					display: grid;
					grid-template-columns: auto 1fr;
					gap: 1ex;
					align-items: center;
					padding: 0.125rem 0.5rem;
					border-radius: var(--radius-sm);
					cursor: pointer;
					user-select: none;

					&:hover {
						background: var(--c-box-2);
					}
				}
			}
		}
	}
</style>
