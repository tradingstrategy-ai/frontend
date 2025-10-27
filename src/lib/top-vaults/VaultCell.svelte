<script lang="ts">
	interface Props {
		name: string;
		protocol: string;
	}

	let { name, protocol }: Props = $props();
</script>

<div class="vault-cell multiline">
	<strong>{name}</strong>
	{#if protocol}
		<span class="protocol">{protocol}</span>
	{/if}
</div>

<style>
	.protocol {
		color: var(--c-text-light);
		text-transform: uppercase;
	}
</style>
