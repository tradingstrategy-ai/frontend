<script lang="ts">
	import type { LendingReserve } from './lending-reserve-client';
	import { EntitySymbol } from '$lib/components';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let reserve: LendingReserve;
	export let hideChainIcon = false;
</script>

<EntitySymbol
	label={reserve.chain_name}
	logoUrl={hideChainIcon ? undefined : getLogoUrl('blockchain', reserve.chain_slug)}
>
	{reserve.asset_name}
	<span class="symbol">{reserve.asset_symbol}</span>
</EntitySymbol>

<style lang="postcss">
	.symbol {
		margin-left: 0.25em;
		color: var(--c-text-extra-light);
	}
</style>
