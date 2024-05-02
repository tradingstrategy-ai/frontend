<script lang="ts">
	import type { LendingReserve } from './lending-reserve-client';
	import { EntitySymbol } from '$lib/components';

	export let reserve: LendingReserve;
	export let hideChainIcon = false;
</script>

<EntitySymbol type="blockchain" slug={hideChainIcon ? undefined : reserve.chain_slug} label={reserve.chain_name}>
	{reserve.asset_name}
	<span class="symbol">{reserve.asset_symbol}</span>
</EntitySymbol>

<style lang="postcss">
	.symbol {
		margin-left: 0.25em;
		color: var(--c-text-extra-light);
	}
</style>
