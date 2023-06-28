<script lang="ts">
	import { switchNetwork } from '@wagmi/core';
	import { AlertItem, AlertList, Button } from '$lib/components';

	export let chainId: number;
	export let chainName: string;
	export let size: 'xs' | 'sm' | 'md' | 'lg' = 'md';

	const buttonSize = {
		xs: 'xs',
		sm: 'xs',
		md: 'sm',
		lg: 'md'
	} as const;
</script>

<div class="wrong-network">
	<AlertList {size} status="error">
		<AlertItem title="Wrong network">
			Please connect to {chainName}
			<Button slot="cta" size={buttonSize[size]} label="Switch network" on:click={() => switchNetwork({ chainId })} />
		</AlertItem>
	</AlertList>
</div>

<style lang="postcss">
	.wrong-network :global(.alert-item) {
		container-type: normal;
	}
</style>
