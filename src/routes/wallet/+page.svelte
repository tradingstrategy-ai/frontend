<script lang="ts">
	import { connected, chainId, defaultEvmStores, signerAddress } from 'svelte-ethers-store';
	import { getChainName } from 'trade-executor-frontend/helpers/chain-explorer';
	import { Button, Section } from '$lib/components';
</script>

<Section padding="sm" gap="xs">
	<h2>Wallet connection MVP</h2>

	{#if $connected}
		<div>
			<p>Your wallet is connected!</p>
			<p><strong>Chain:</strong> {getChainName(Number($chainId)) || $chainId}</p>
			<p><strong>Signer address:</strong> {$signerAddress}</p>
			<Button label="Disconnect" on:click={() => defaultEvmStores.disconnect()} />
		</div>
	{:else}
		<div>
			<Button label="Connect wallet" on:click={() => defaultEvmStores.setProvider()} />
		</div>
	{/if}
</Section>
