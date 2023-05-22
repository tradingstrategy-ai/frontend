<script lang="ts">
	import wizard from '../store';
	import { Button, EntitySymbol, WizardActions } from '$lib/components';
</script>

<div class="redemption-success">
	<h3>The following tokens have been added to your wallet</h3>

	<table class="responsive">
		<tbody>
			<tr>
				<td><EntitySymbol type="token" label="USDC" slug="usdc" /></td>
				<td>1200</td>
			</tr>
		</tbody>
	</table>
</div>

<WizardActions>
	<Button secondary label="Back" href="shares-redemption" />
	<Button label="Done" href={$wizard.returnTo} />
</WizardActions>

<style>
	.redemption-success {
		display: grid;
		gap: var(--space-md);
	}
	h3 {
		color: hsla(var(--hsl-text-light));
		font: var(--f-ui-lg-medium);
	}
</style>
