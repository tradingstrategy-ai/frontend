<script lang="ts">
	let classes = '';
	export { classes as class };
	export let label: string = '';
	export let value: string | number = '';
</script>

<div class={classes ?? null}>
	<span class="label">{label}</span>
	<span class="value">{value}</span>
</div>

<style>
	div {
		background: var(--c-background-5);
		border-radius: var(--border-radius-md);
		display: grid;
		gap: 0.875rem;
		padding: 1.5rem;
	}

	.label {
		color: var(--c-text-extra-light);
		font: var(--f-ui-md-medium);
	}

	.value {
		font: var(--f-ui-xxl-medium);
	}
</style>
