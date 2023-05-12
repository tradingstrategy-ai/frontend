<script lang="ts">
	import AlertItem from '$lib/components/AlertItem.svelte';
	import AlertList from '$lib/components/AlertList.svelte';
	import Button from '$lib/components/Button.svelte';
	import SummaryBox from '$lib/components/SummaryBox.svelte';
	import WalletWidget from '$lib/components/WalletWidget.svelte';

	export let isWalletConnected = true;
</script>

<SummaryBox title="Connected wallet">
	<WalletWidget address="0x6C0836c82d629EF21b9192D88b043e65f4fD7237" chain="polygon" size="md" />
	<!-- <AlertList size="xs">
		<AlertItem>Change network to <strong>Polygon Mainnet</strong></AlertItem>
	</AlertList> -->

	{#if isWalletConnected}
		<AlertList size="xs" status="success">
			<AlertItem t>Your wallet is connected to this strategy</AlertItem>
		</AlertList>
	{:else}{/if}
	<!-- {#if isWalletConnected}
		<Button label="Change wallet" href="/wizard/connect-wallet" />
	{:else}
		<Button label="Connect wallet" href="/wizard/connect-wallet" />
	{/if} -->
</SummaryBox>
