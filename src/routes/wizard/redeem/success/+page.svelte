<script lang="ts">
	import wizard from '../../wizardState';
	import { Button, WizardActions } from '$lib/components';
</script>

<div class="redemption-success">
	<h2>Redemption success</h2>
	<p>
		Congratulations! You've successfully invested in <strong>ETH-USD SMA on Pancake</strong>. Keep an eye on your
		progress and returns. Please note that investing in crypto / DeFi trading strategies carries significant risk. Click
		"Done" to return to the strategy.
	</p>
</div>

<WizardActions>
	<Button secondary label="Back" href="payment" />
	<Button label="Done" href={$wizard?.returnTo} />
</WizardActions>
