<script lang="ts">
	import wizard from '../../wizardState';
	import { Button, WizardActions } from '$lib/components';
</script>

<div class="connect-wallet-introduction">
	<p>
		Connect your crypto wallet to Trading Strategy in just a few clicks! Choose between MetaMask or WalletConnect,
		connect your wallet, and view your current crypto balances. Let's get started!
	</p>
</div>

<WizardActions>
	<Button ghost href={$wizard?.returnTo}>Cancel</Button>
	<Button href="connect">Next</Button>
</WizardActions>
