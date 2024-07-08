<script lang="ts">
	import { EntitySymbol } from '$lib/components';
	import { formatSwapFee } from '$lib/helpers/formatters';

	export let symbol: string;
	export let swapFee: number;
	export let chainName: string;
	export let logoUrl: MaybeString = undefined;
</script>

<EntitySymbol {logoUrl} label={chainName}>
	<div>
		{symbol}
		<span>
			{formatSwapFee(swapFee)}
		</span>
	</div>
</EntitySymbol>

<style lang="postcss">
	div {
		white-space: nowrap;
	}

	span {
		color: var(--c-text-extra-light);
	}
</style>
