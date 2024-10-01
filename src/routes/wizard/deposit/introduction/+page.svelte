<script lang="ts">
	import type { DepositWizardData } from '../+layout';
	import { wizard } from 'wizard/store';

	const { strategyName, denominationToken } = $wizard.data as DepositWizardData;

	wizard.toggleComplete('introduction');
</script>

<div class="deposit-introduction">
	<p>
		Ready to deposit in <strong>{strategyName}</strong>? Deposit <strong>{denominationToken.label}</strong> to add this strategy
		to your DeFi trading portfolio. Connect your wallet, review your balances, enter your desired deposit amount, and make
		your payment. Let's get started!
	</p>
</div>
