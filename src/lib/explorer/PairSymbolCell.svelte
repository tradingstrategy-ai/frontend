<script lang="ts">
	import { EntitySymbol } from '$lib/components';
	import { formatSwapFee } from '$lib/helpers/formatters';

	interface Props {
		symbol: string;
		swapFee: number;
		chainName: string;
		logoUrl: MaybeString;
	}

	let { symbol, swapFee, chainName, logoUrl }: Props = $props();
</script>

<EntitySymbol {logoUrl} label={chainName}>
	<div>
		<span class="symbol">{symbol}</span>
		<span class="fee">
			{formatSwapFee(swapFee)}
		</span>
	</div>
</EntitySymbol>

<style>
	div {
		white-space: nowrap;
		display: flex;
		gap: 0.5rem;
	}

	.symbol {
		display: inline-block;
		overflow-x: hidden;
		text-overflow: ellipsis;
		max-width: 12ch;
	}

	.fee {
		color: var(--c-text-extra-light);
	}
</style>
