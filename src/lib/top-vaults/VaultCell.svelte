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
		opacity: 0.7;
	}
</style>
