<script lang="ts">
	import wizard from '../../wizardState';
	import { Button, WizardActions } from '$lib/components';
</script>

<div class="connect-wallet-success">
	<p>
		Congratulations! Your crypto wallet is now connected to Trading Strategy. You can start investing in token trading
		strategies right away. Click "Done" to return to where you were before connecting your wallet. Happy trading!
	</p>
</div>

<WizardActions>
	<Button secondary href="balance">Back</Button>
	<Button href={$wizard?.returnTo}>Done</Button>
</WizardActions>
