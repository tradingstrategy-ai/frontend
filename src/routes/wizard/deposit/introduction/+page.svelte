<script lang="ts">
	import wizard from '../../wizardState';
	import { Button, WizardActions } from '$lib/components';
</script>

<div class="deposit-introduction">
	<p>
		Ready to invest in <strong>ETH-USD SMA on Pancake</strong>? Deposit USDC to add this strategy to your DeFi trading
		portfolio. Connect your wallet, review your balances, enter your desired investment amount, and make your payment.
		Let's get started!
	</p>
</div>

<WizardActions>
	<Button ghost href={$wizard?.returnTo}>Cancel</Button>
	<Button href="connect">Next</Button>
</WizardActions>
