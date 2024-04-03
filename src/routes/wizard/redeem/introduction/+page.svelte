<script lang="ts">
	import { wizard } from 'wizard/store';

	wizard.toggleComplete('introduction');
</script>

<div class="deposit-introduction">
	<p>
		Ready to redeem shares of <strong>{$wizard.data.strategyName}</strong>? Upon redemption, you'll receive USDC.e and
		any tokens the strategy is currently invested in. Connect your wallet, review your share balance, enter your desired
		redemption amount, and complete your transaction. Let's get started!
	</p>
</div>
