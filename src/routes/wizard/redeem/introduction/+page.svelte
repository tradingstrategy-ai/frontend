<script lang="ts">
	import wizard from '../../wizardState';
	import { Button, WizardActions } from '$lib/components';
</script>

<div class="deposit-introduction">
	<p>Redeem copy goes here</p>
</div>

<WizardActions>
	<Button ghost label="Cancel" href={$wizard?.returnTo} slot="cancel" />
	<Button label="Next" href="connect" on:click={() => wizard.complete('introduction')} />
</WizardActions>
