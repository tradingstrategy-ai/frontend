<script lang="ts">
	import { switchNetwork } from '@wagmi/core';
	import { Alert, Button } from '$lib/components';

	export let chainId: number;
	export let chainName: string;
	export let size: 'xs' | 'sm' | 'md' | 'lg' = 'md';
	export let hideButton = false;

	const buttonSize = {
		xs: 'xs',
		sm: 'xs',
		md: 'sm',
		lg: 'md'
	} as const;
</script>

<div class="wrong-network">
	<Alert {size} status="error" title="Wrong network">
		Please connect to {chainName}
		{#if !hideButton}
			<Button slot="cta" size={buttonSize[size]} label="Switch network" on:click={() => switchNetwork({ chainId })} />
		{/if}
	</Alert>
</div>

<style lang="postcss">
	.wrong-network :global(.alert-item) {
		container-type: normal;
	}
</style>
