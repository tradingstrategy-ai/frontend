<script lang="ts">
	import wizard from '$lib/wizard/store';
	import { Button, WizardActions } from '$lib/components';
</script>

<div class="connect-wallet-success">
	<p>
		Congratulations! Your crypto wallet is now connected to Trading Strategy. You can start investing in token trading
		strategies right away. Click "Done" to return to where you were before connecting your wallet. Happy trading!
	</p>
</div>

<WizardActions>
	<Button secondary label="Back" href="balance" />
	<Button label="Done" href={$wizard?.returnTo} />
</WizardActions>
