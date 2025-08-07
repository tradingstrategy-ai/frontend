<script lang="ts">
	import type { ChartPairs } from 'trade-executor/schemas/chart';
	import { slide } from 'svelte/transition';
	import fsm from 'svelte-fsm';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		selectedPairIds: number[];
		tradingPairs: ChartPairs;
		onchange?: (ids: number[]) => void;
	}

	let { selectedPairIds, tradingPairs, onchange }: Props = $props();

	// selected pair ids during editing, prior to committing (save) or reverting (cancel)
	let provisionalPairIds = $state(selectedPairIds);

	let provisionalPairs = $derived(
		tradingPairs.all_pairs.filter((p) => {
			return provisionalPairIds.includes(p.internal_id!);
		})
	);

	const pairSelector = fsm('ready', {
		ready: {
			edit: 'editing'
		},

		editing: {
			save() {
				onchange?.(provisionalPairIds);
				return 'ready';
			},

			cancel() {
				provisionalPairIds = selectedPairIds;
				return 'ready';
			}
		}
	});
</script>

<div class="pairs-selector">
	<label class="current-selection tile b">
		<span>Pairs: {provisionalPairs.map((p) => p.symbol).join(', ')}</span>
		<Button size="xs" disabled={$pairSelector === 'editing'} on:click={pairSelector.edit}>Edit</Button>
	</label>

	{#if $pairSelector === 'editing'}
		<div class="dialog" transition:slide={{ duration: 250 }}>
			<div class="inner">
				<header>
					<h4>Select pairs</h4>
					<Button size="xs" ghost on:click={pairSelector.cancel}>Cancel</Button>
					<Button size="xs" on:click={pairSelector.save}>Save</Button>
				</header>
				<div class="pairs">
					{#each tradingPairs.all_pairs as pair (pair.internal_id)}
						<label>
							<input type="checkbox" value={pair.internal_id} bind:group={provisionalPairIds} />
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
