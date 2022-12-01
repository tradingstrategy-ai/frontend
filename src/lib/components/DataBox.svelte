<script lang="ts">
	let classes = '';
	export { classes as class };
	export let label: string = '';
	export let value: string | number = '';
</script>

<div class="data-box {classes ?? null}">
	<span class="label">{label}</span>
	<span class="value">{value}</span>
</div>

<style>
	.data-box {
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

	@media all and (max-width: 767px) {
		.data-box {
			gap: 0.5rem;
			padding: 1.25rem;
		}
		.label {
			font: var(--f-ui-sm-medium);
		}

		.value {
			font: var(--f-ui-xl-medium);
		}
	}
</style>
