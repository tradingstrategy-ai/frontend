<script lang="ts">
	import wizard from '../store';
	import { Button, WizardActions } from '$lib/components';

	wizard.complete('introduction');
</script>

<div class="deposit-introduction">
	<p>Redeem copy goes here</p>
</div>

<WizardActions>
	<Button ghost label="Cancel" href={$wizard.returnTo} />
	<Button label="Next" href="connect" disabled={!$wizard.completed.has('introduction')} />
</WizardActions>
