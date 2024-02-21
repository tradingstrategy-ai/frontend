<script lang="ts">
	import { EntitySymbol } from '$lib/components';
	import { formatSwapFee } from '$lib/helpers/formatters';

	export let chainSlug: string | undefined = undefined;
	export let chainName: string | undefined = undefined;
	export let symbol: string;
	export let swapFee: number;
</script>

<EntitySymbol type="blockchain" slug={chainSlug} label={chainName} size="1.25em">
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
