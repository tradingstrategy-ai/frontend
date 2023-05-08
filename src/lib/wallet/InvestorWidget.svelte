<script lang="ts">
	import { Button, SummaryBox } from '$lib/components';

	export let strategyId: string;
	export let chainId: number;
</script>

<SummaryBox title="Invest">
	<div class="investor-actions">
		<Button label="Connect wallet" href="/wizard/connect-wallet?returnTo=/strategies/{strategyId}&chainId={chainId}" />
		<Button label="Deposit" disabled />
		<Button label="Redeem" disabled />
	</div>
</SummaryBox>

<style lang="postcss">
	.investor-actions {
		display: grid;
		gap: var(--space-ml);
		grid-template-columns: repeat(3, 1fr);
		@media (--viewport-sm-down) {
			grid-template-columns: 1fr;
		}
	}
</style>
