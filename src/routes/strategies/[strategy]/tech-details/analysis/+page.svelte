<script lang="ts">
	import { goto } from '$app/navigation';
	import Alert from '$lib/components/Alert.svelte';
	import Spinner from '$lib/components/Spinner.svelte';

	let { data } = $props();
	let { strategy, chartRegistrations, chartId, contentPromise } = $derived(data);

	function handleAnalysisChange(this: HTMLSelectElement) {
		goto(`?chart_id=${this.value}`, { noScroll: true });
	}
</script>

<svelte:head>
	<title>Analysis | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Analysis charts and tables for {strategy.name} strategy" />
</svelte:head>

<section class="analysis">
	<p>
		<select onchange={handleAnalysisChange}>
			<option value="">Select analysis</option>
			{#each chartRegistrations as { id, name } (id)}
				<option value={id} selected={id === chartId}>{name}</option>
			{/each}
		</select>
	</p>

	<div class="content">
		{#await contentPromise}
			<div class="loading">
				<Spinner size="60" />
			</div>
		{:then content}
			{#if content?.type === 'image/png'}
				<img src={URL.createObjectURL(content.data)} alt="Analysis content" />
			{:else if content?.type === 'text/html'}
				<!--  eslint-disable-next-line svelte/no-at-html-tags -->
				{@html content.data}
			{:else}
				Nothing to display
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
		select {
			border-radius: var(--radius-sm);
			padding: 0.5rem;
			margin-bottom: 1rem;
		}

		.content {
			min-height: 500px;
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
