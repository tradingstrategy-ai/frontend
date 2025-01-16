<script lang="ts">
	import WalletBalance from '$lib/wallet/WalletBalance.svelte';

	let { data } = $props();

	const { wizard, nativeCurrency, denominationToken } = data;

	wizard.toggleComplete('balance');
</script>

<WalletBalance {nativeCurrency} {denominationToken} />
