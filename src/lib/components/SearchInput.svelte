<script lang="ts">
	export let id: string;
	export let name: string;
	export let value: string;
	export let placeholder: string = '';
</script>

<div class="search-input">
	<input class="text-field" type="search" bind:value {name} {id} {placeholder} />
</div>

<style>
	.search-input input {
		width: 100%;
	}
</style>
