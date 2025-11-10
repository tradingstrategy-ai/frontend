<script lang="ts">
	import { notFilledMarker } from '$lib/helpers/formatters';

	interface Props {
		value: number | null;
	}

	let { value }: Props = $props();

	const formatter = new Intl.NumberFormat('en-US', {
		notation: 'compact',
		compactDisplay: 'short'
	});

	let { number, unit } = $derived.by(() => {
		if (value === null) return { number: notFilledMarker, unit: '' };

		const parts = formatter.formatToParts(value);

		const number = parts
			.filter((p) => p.type === 'integer' || p.type === 'decimal' || p.type === 'fraction')
			.map((p) => p.value)
			.join('');

		const unit = parts.find((p) => p.type === 'compact')?.value || null;

		return { number, unit };
	});
</script>

<div class="deposit-events-cell">
	<span>{number}</span>
	{#if unit}
		<span class="unit">{unit}</span>
	{/if}
</div>

<style>
	.deposit-events-cell {
		display: inline-flex;
		gap: 0.5ex;
	}
</style>
