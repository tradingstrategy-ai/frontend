<script lang="ts">
	import wizard from '../store';
	import { Button, WizardActions } from '$lib/components';

	wizard.complete('introduction');
</script>

<div class="deposit-introduction">
	<p>
		Ready to redeem shares of <strong>{$wizard.data.strategyName}</strong>? Upon redemption, you'll receive USDC and any
		tokens the strategy is currently invested in. Connect your wallet, review your share balance, enter your desired
		redemption amount, and complete your transaction. Let's get started!
	</p>
</div>

<WizardActions>
	<Button ghost label="Cancel" href={$wizard.returnTo} />
	<Button label="Next" href="connect" disabled={!$wizard.completed.has('introduction')} />
</WizardActions>
