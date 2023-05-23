<script lang="ts">
	import wizard from '$lib/wizard/store';
	import { Button, WizardActions } from '$lib/components';

	$wizard?.completed.add('introduction');
</script>

<div class="connect-wallet-introduction">
	<p>
		Connect your crypto wallet to Trading Strategy in just a few clicks! Choose between MetaMask or WalletConnect,
		connect your wallet, and view your current crypto balances. Let's get started!
	</p>
</div>

<WizardActions>
	<Button ghost label="Cancel" href={$wizard?.returnTo} />
	<Button label="Next" href="connect" on:click={() => wizard.complete('introduction')} />
</WizardActions>
