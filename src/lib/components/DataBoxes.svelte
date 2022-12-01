<script lang="ts">
	import DataBox from '$lib/components/DataBox.svelte';

	let classes = '';
	export { classes as class };
	export let items: { label: string; value: string | number }[] = [];
</script>

<section class="data-boxes {classes}">
	{#each items as { label, value }}
		<DataBox {label} {value} />
	{/each}
</section>

<style>
	.data-boxes {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr));
	}

	@media all and (max-width: 767px) {
		.data-boxes {
			gap: 1rem;
		}
	}
</style>
