<script lang="ts">
	import { getWizardContext } from '$lib/wizard/state.svelte.js';
	import WalletBalance from '$lib/wallet/WalletBalance.svelte';

	const wizard = getWizardContext();

	let { data } = $props();
	const { nativeCurrency, denominationToken } = data;

	wizard.toggleComplete('balance');
</script>

<WalletBalance {nativeCurrency} {denominationToken} />
