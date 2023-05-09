<script lang="ts">
	import type { Address } from '@wagmi/core';
	import { wallet } from '$lib/wallet/client';
	import { AlertList, AlertItem, Button, DataBox, EntitySymbol, Grid, SummaryBox } from '$lib/components';

	export let strategyId: string;
	export let chainId: number;
</script>

<SummaryBox title="Deposit status">
	<div class="content">
		{#if $wallet.status !== 'connected'}
			<AlertList status="warning" size="md">
				<AlertItem title="Wallet not connected">Please connect wallet to see your deposit status</AlertItem>
			</AlertList>
		{:else}
			<Grid cols={2} gap="lg">
				<DataBox label="Deposit status">
					<EntitySymbol slug="usdc" type="token">1000.25 USDC</EntitySymbol>
				</DataBox>
				<DataBox label="Strategy shares">
					<EntitySymbol slug="uni" type="token">123.45 SHR</EntitySymbol>
				</DataBox>
			</Grid>
		{/if}
	</div>
	<div class="actions">
		<Button href="/wizard/connect-wallet?returnTo=/strategies/{strategyId}&chainId={chainId}">
			{$wallet.status === 'connected' ? 'Change wallet' : 'Connect wallet'}
		</Button>
		<Button label="Deposit" disabled />
		<Button label="Redeem" disabled />
	</div>
</SummaryBox>

<style lang="postcss">
	.actions {
		display: grid;
		gap: var(--space-ml);
		grid-template-columns: repeat(3, 1fr);
		@media (--viewport-sm-down) {
			grid-template-columns: 1fr;
		}
	}
</style>
