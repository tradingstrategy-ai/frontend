<script lang="ts">
	interface Props {
		value: string | null;
	}

	const { value }: Props = $props();

	const riskClass = value?.toLowerCase().replace(/ /g, '-');
</script>

<div class={['risk', riskClass]}>
	{value ?? 'Unknown'}
</div>

<style>
	.risk {
		display: inline-grid;
		align-items: center;
		height: 1.5rem;
		padding: 0 0.75rem;
		border-radius: 1rem;
		background: color-mix(in srgb, transparent, var(--c-text-extra-light) 30%);
		font-weight: 500;
		font-family: var(--ff-ui);
		letter-spacing: 0.02em;
	}
</style>
