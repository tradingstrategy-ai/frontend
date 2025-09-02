<script lang="ts">
	import type { ChartKind, ChartPairs, TradingPairs } from 'trade-executor/schemas/chart';
	import { slide } from 'svelte/transition';
	import fsm from 'svelte-fsm';
	import Button from '$lib/components/Button.svelte';
	import TextInput from '$lib/components/TextInput.svelte';

	interface Props {
		selectedPairIds: number[];
		tradingPairs: ChartPairs;
		chartKind: ChartKind | undefined;
		onchange?: (ids: number[]) => void;
	}

	let { selectedPairIds, tradingPairs, chartKind, onchange }: Props = $props();

	let singlePair = $derived(chartKind?.includes('_single_'));
	let multiPair = $derived(chartKind?.includes('_multi_'));
	let disabled = $derived(!(singlePair || multiPair));

	// selected pair ids during editing, prior to committing (save) or reverting (cancel)
	let multiPairIds = $derived(selectedPairIds);
	let singlePairId = $derived(selectedPairIds[0]);

	let provisionalPairs = $derived(
		tradingPairs.all_pairs.filter((p) => {
			if (singlePair) {
				return p.internal_id! === singlePairId;
			}
			return multiPairIds.includes(p.internal_id!);
		})
	);

	let search = $state('');

	const pairSelector = fsm('ready', {
		ready: {
			_enter() {
				search = '';
			},

			edit() {
				return singlePair ? 'editingSingle' : 'editingMulti';
			}
		},

		editingSingle: {
			select(pairs: TradingPairs) {
				singlePairId = pairs[0]?.internal_id;
			},

			save() {
				onchange?.([singlePairId]);
				return 'ready';
			},

			cancel() {
				singlePairId = selectedPairIds[0];
				return 'ready';
			}
		},

		editingMulti: {
			select(pairs: TradingPairs) {
				multiPairIds = pairs.map((p) => p.internal_id!);
			},

			save() {
				onchange?.(multiPairIds);
				return 'ready';
			},

			cancel() {
				multiPairIds = selectedPairIds;
				return 'ready';
			}
		}
	});

	let editing = $derived($pairSelector.startsWith('editing'));
</script>

<div class="pairs-selector">
	<label class={['current-selection', editing && 'editing', disabled && 'disabled']}>
		<span class="title">
			{singlePair ? 'Pair' : 'Pairs'}:
		</span>
		<span class="selected-pairs">
			{#if disabled}
				No pairs required
			{:else if tradingPairs.all_pairs.length === 0}
				No pairs loaded
			{:else if provisionalPairs.length === 0}
				No pairs selected
			{:else}
				{provisionalPairs.map((p) => p.symbol).join(', ')}
			{/if}
		</span>
		<Button size="xs" secondary disabled={disabled || editing} on:click={pairSelector.edit}>Edit</Button>
	</label>

	{#if editing}
		<div class="dialog" transition:slide={{ duration: 250 }}>
			<div class="inner">
				<header>
					<h4>Select pairs</h4>
					<div class="button-group quick-select">
						<Button size="xs" tertiary on:click={() => pairSelector.select(tradingPairs.default_pairs)}>Default</Button>
						{#if multiPair}
							<Button size="xs" tertiary on:click={() => pairSelector.select(tradingPairs.all_pairs)}>All</Button>
						{/if}
						<Button size="xs" tertiary on:click={() => pairSelector.select([])}>None</Button>
					</div>
					<div class="search">
						<TextInput bind:value={search} type="search" size="sm" placeholder="Search" />
					</div>
					<div class="button-group primary-controls">
						<Button size="xs" ghost on:click={pairSelector.cancel}>Cancel</Button>
						<Button size="xs" secondary disabled={multiPairIds.length === 0} on:click={pairSelector.save}>Save</Button>
					</div>
				</header>
				<div class="pairs">
					{#each tradingPairs.all_pairs as pair (pair.internal_id)}
						<label hidden={!pair.symbol.toLowerCase().includes(search.toLowerCase())}>
							{#if singlePair}
								<input type="radio" value={pair.internal_id} bind:group={singlePairId} />
							{:else}
								<input type="checkbox" value={pair.internal_id} bind:group={multiPairIds} />
							{/if}
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
			padding-inline: 0.75rem 0.5rem;
			background: var(--c-box-2);
			border: 1px solid var(--c-text-ultra-light);
			border-radius: var(--radius-sm);
			cursor: pointer;

			&:hover:not(.disabled),
			&.editing {
				background: var(--c-box-3);
				border-color: var(--c-text-extra-light);
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
				border: 1px solid var(--c-text-extra-light);
				border-radius: var(--radius-sm);
				box-shadow: inset var(--shadow-2);
				overflow: hidden;
			}

			header {
				display: grid;
				grid-template-columns:
					[title] auto
					[quick-select] 1fr
					[search] auto
					[primary-controls] auto;
				grid-template-rows: auto;
				gap: 0.75rem 1.25rem;
				align-items: center;

				@media (--viewport-sm-down) {
					grid-template-columns:
						[title quick-select] auto
						[search primary-controls] 1fr;
				}

				h4 {
					grid-column-start: title;
					font: var(--f-heading-xs-medium);
					white-space: nowrap;
				}

				.search {
					grid-column-start: search;
					text-align: right;
				}

				.quick-select {
					grid-column-start: quick-select;
				}

				.primary-controls {
					grid-row-start: 1;
					grid-column-start: primary-controls;
					justify-content: end;
				}

				.button-group {
					display: flex;
					gap: 0.5rem;
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

					&[hidden] {
						display: none;
					}
				}
			}
		}
	}
</style>
