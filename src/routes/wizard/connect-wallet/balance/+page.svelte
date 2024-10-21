<script lang="ts">
	import { wizard } from 'wizard/store';
	import WalletBalance from '$lib/wallet/WalletBalance.svelte';

	export let data;
	const { nativeCurrency, denominationToken } = data;

	wizard.toggleComplete('balance');
</script>

<WalletBalance {nativeCurrency} {denominationToken} />
