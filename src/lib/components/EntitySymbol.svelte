<script lang="ts">
	import BlockchainLogo from '../assets/logos/BlockchainLogo.svelte';
	import TokenLogo from '../assets/logos/TokenLogo.svelte';

	export let name: string;
	export let size = '1.5rem';
	export let type: 'blockchain' | 'dex' | 'token' | 'wallet';
</script>

<div class="entity-symbol">
	{#if type === 'blockchain'}
		<BlockchainLogo {name} {size} />
	{:else if type === 'token'}
		<TokenLogo {name} {size} />
	{/if}
	{name}
</div>

<style>
	.entity-symbol {
		display: flex;
		gap: var(--space-sm);
		align-items: center;
	}
</style>
