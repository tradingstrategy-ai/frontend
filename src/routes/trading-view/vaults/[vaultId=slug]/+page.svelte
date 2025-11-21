<script lang="ts">
	let { data } = $props();
	let { vault } = $derived(data);
</script>

<h3>{vault.name}</h3>

<style>
	h3 {
		font: var(--f-heading-md-medium);
	}
</style>
