<script lang="ts">
	import { goto } from '$app/navigation';
	import Alert from '$lib/components/Alert.svelte';
	import Select from '$lib/components/Select.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import PairsSelector from './PairsSelector.svelte';

	let { data } = $props();
	let { strategy, chartRegistrations, selectedChart, tradingPairs, selectedPairIds, contentPromise } = $derived(data);

	function updateAnalysis({ chart_id, pair_ids }: { chart_id?: string; pair_ids?: number[] }) {
		const params = new URLSearchParams({
			chart_id: chart_id ?? selectedChart?.id ?? '',
			pair_ids: (pair_ids ?? selectedPairIds).join(',')
		});
		goto(`?${params}`, { noScroll: true });
	}
</script>

<svelte:head>
	<title>Analysis | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Analysis charts and tables for {strategy.name} strategy" />
</svelte:head>

<section class="analysis">
	<div class="controls">
		<Select onchange={(e) => updateAnalysis({ chart_id: e.currentTarget.value })}>
			<option value="">Select analysis</option>
			{#each chartRegistrations as { id, name } (id)}
				<option value={id} selected={id === selectedChart?.id}>{name}</option>
			{/each}
		</Select>
		<PairsSelector
			{selectedPairIds}
			{tradingPairs}
			chartKind={selectedChart?.kind}
			onchange={(pair_ids) => updateAnalysis({ pair_ids })}
		/>
	</div>

	<div class="content">
		{#await contentPromise}
			<div class="loading">
				<Spinner size="60" />
			</div>
		{:then content}
			{#if !content}
				<p>Select analysis from the drop-down above.</p>
			{:else if content.type === 'image/png'}
				<img src={URL.createObjectURL(content.data)} alt="Analysis content" />
			{:else if content.type === 'text/html'}
				<!--  eslint-disable-next-line svelte/no-at-html-tags -->
				{@html content.data}
			{/if}
		{:catch error}
			<Alert size="md" status="error" title="Error loading analysis">
				<pre class="error-detail">{error}</pre>
			</Alert>
		{/await}
	</div>
</section>

<style>
	.analysis {
		position: relative;
		display: grid;
		gap: 1.5rem;

		.controls {
			display: grid;
			grid-template-columns: auto 1fr;
			align-items: center;
			gap: 1rem;
		}

		.content {
			min-height: 500px;
			overflow: auto;

			p {
				padding: 1rem 0.5rem;
			}

			:global(table) {
				width: 100%;
				border-collapse: collapse;
				color: inherit;
				background: var(--c-box-1);
				font: var(--f-mono-sm-regular);
				line-height: 1.2;
				letter-spacing: var(--f-mono-sm-spacing, normal);

				@media (--viewport-xs) {
					font-size: 12px;
				}

				:global(:is(td, th)) {
					padding: 0.25em 0.5em;
					border-block: 1px solid var(--c-text-ultra-light);
					vertical-align: top;

					&:first-child {
						padding-left: 0.25em;
					}

					&:last-child {
						padding-right: 0.25em;
					}
				}

				:global(tbody :is(td, th)) {
					/* Alternating column colors */
					&:nth-child(even) {
						background-color: var(--c-box-3);
					}

					&:nth-child(odd) {
						background-color: var(--c-box-1);
					}
				}

				:global(thead th) {
					background: var(--c-box-3);
					font-weight: 900;
					border-bottom: 2px solid currentColor;
				}
			}
		}

		.loading {
			display: grid;
			place-content: center;
			min-height: inherit;
		}

		.error-detail {
			white-space: pre-wrap;
			font: var(--f-code-md-regular);
		}
	}
</style>
