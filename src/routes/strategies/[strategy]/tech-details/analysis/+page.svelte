<script lang="ts">
	import { goto } from '$app/navigation';
	import Alert from '$lib/components/Alert.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import PairsSelector from './PairsSelector.svelte';

	let { data } = $props();
	let { strategy, chartRegistrations, tradingPairs, chartId, selectedPairIds, contentPromise } = $derived(data);

	function handleChange() {
		const params = new URLSearchParams({
			chart_id: chartId ?? '',
			pair_ids: selectedPairIds.join(',')
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
		<select bind:value={chartId} onchange={handleChange}>
			<option value="">Select analysis</option>
			{#each chartRegistrations as { id, name } (id)}
				<option value={id} selected={id === chartId}>{name}</option>
			{/each}
		</select>
		<PairsSelector bind:selectedPairIds {tradingPairs} onchange={handleChange} />
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

		select {
			border-radius: var(--radius-sm);
			padding: 0.5rem;
			margin-bottom: 1rem;
		}

		.controls {
			display: grid;
			grid-template-columns: auto 1fr;
			align-items: center;
			gap: 1rem;

			select {
				margin: 0;
			}
		}

		.content {
			min-height: 500px;

			p {
				padding: 1rem 0.5rem;
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
