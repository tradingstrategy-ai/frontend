<script lang="ts">
	import type { ChartPairs } from 'trade-executor/schemas/chart';
	import { slide } from 'svelte/transition';
	import fsm from 'svelte-fsm';
	import Button from '$lib/components/Button.svelte';

	interface Props {
		selectedPairIds: number[];
		tradingPairs: ChartPairs;
		disabled?: boolean;
		onchange?: (ids: number[]) => void;
	}

	let { selectedPairIds, tradingPairs, disabled = false, onchange }: Props = $props();

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

	let editing = $derived($pairSelector === 'editing');
</script>

<div class="pairs-selector">
	<label class={['current-selection', editing && 'editing', disabled && 'disabled']}>
		<span class="title">Pairs:</span>
		<span class="selected-pairs">
			{#if tradingPairs.all_pairs.length === 0}
				No pairs loaded
			{:else if provisionalPairs.length === 0}
				No pairs selected
			{:else}
				{provisionalPairs.map((p) => p.symbol).join(', ')}
			{/if}
		</span>
		<Button size="xs" disabled={disabled || editing} on:click={pairSelector.edit}>Edit</Button>
	</label>

	{#if editing}
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
			grid-template-columns: auto 1fr auto;
			gap: 1ex;
			align-items: center;
			height: 100%;
			padding-inline: 0.75rem 0.25rem;
			background: var(--c-box-2);
			border-radius: var(--radius-sl);
			cursor: pointer;

			&:hover:not(.disabled),
			&.editing {
				background: var(--c-box-3);
				outline: 1px solid var(--c-box-3);
				box-shadow: inset var(--shadow-2);
			}

			&:is(.editing, .disabled) {
				color: var(--c-text-extra-light);
				cursor: not-allowed;
			}

			.title {
				font-size: smaller;
				font-weight: 500;
				letter-spacing: 0.025em;
				text-transform: uppercase;
				color: var(--c-text-light);
				color: var(--c-text-light);
			}

			.selected-pairs {
				white-space: nowrap;
				overflow: hidden;
				text-overflow: ellipsis;
			}
		}

		.dialog {
			position: absolute;
			inset: 4rem 0 auto 0;
			display: grid;
			max-height: 501px;
			margin-block: -1px;
			background: color-mix(in srgb, var(--c-body), hsl(var(--hsl-box)) var(--box-1-alpha));

			.inner {
				display: grid;
				gap: 0.75rem;
				max-height: inherit;
				padding: 1.25rem 1.5rem;
				background: color-mix(in srgb, transparent, hsl(var(--hsl-box)) var(--box-2-alpha));
				border: 1px solid var(--c-box-3);
				border-radius: var(--radius-sl);
				box-shadow: inset var(--shadow-2);
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
