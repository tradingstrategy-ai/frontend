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
</SummaryBox>
