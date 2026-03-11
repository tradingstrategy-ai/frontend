<script lang="ts">
	import type { SlimVaultInfo } from '$lib/top-vaults/schemas';
	import { formatAmount, formatDollar, formatPercent } from '$lib/helpers/formatters';
	import { calculateTotalTvl } from '$lib/top-vaults/helpers';
	import IconQuestionCircle from '~icons/local/question-circle';
	import Tooltip from '$lib/components/Tooltip.svelte';

	interface Props {
		baseVaults: SlimVaultInfo[];
		rankedVaults: SlimVaultInfo[];
	}

	let { baseVaults, rankedVaults }: Props = $props();

	let totalTvl = $derived(calculateTotalTvl(baseVaults));
	let formattedTvl = $derived(formatDollar(totalTvl).split(/(?=[KMBT])/));

	let avgApy = $derived.by(() => {
		const tvl = calculateTotalTvl(rankedVaults);
		if (tvl === 0) return 0;

		return rankedVaults.reduce((acc, v) => {
			const weight = v.current_nav! / tvl;
			return acc + weight * (v.one_month_cagr_net ?? v.one_month_cagr ?? 0);
		}, 0);
	});
</script>

<dl class="vault-summary-metrics ds-3">
	<div>
		<dt>Total value locked</dt>
		<dd>
			{formattedTvl[0]}
			<small>{formattedTvl[1]}</small>
		</dd>
	</div>
	<div class="avg-returns">
		<dt>
			<Tooltip>
				<span slot="trigger" class="underline">
					Avg. 1M APY
					<IconQuestionCircle />
				</span>
				<span slot="popup">TVL-weighted average of {rankedVaults.length} vaults with minimum $50k TVL.</span>
			</Tooltip>
		</dt>
		<dd>
			{formatPercent(avgApy).slice(0, -1)}
			<small>%</small>
		</dd>
	</div>
</dl>

<style>
	.vault-summary-metrics {
		width: 100%;
		max-width: 50rem;
		margin-inline: auto;
		margin-block: 1.5rem;
		display: flex;
		flex-wrap: wrap;
		justify-content: space-evenly;
		gap: 2rem;
		text-align: center;

		div {
			display: flex;
			flex-direction: column-reverse;
			align-items: center;
			gap: 0.5rem;

			@media (--viewport-sm-down) {
				gap: 0.25rem;
			}
		}

		dt {
			font: var(--f-ui-sm-medium);
			color: var(--c-text-extra-light);
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}

		dd {
			display: flex;
			align-items: baseline;
			font: var(--f-heading-xxxl-bold);
			letter-spacing: var(--ls-heading-xxxl, normal);
			color: var(--c-text-light);
			line-height: 1;

			@media (--viewport-sm-down) {
				font: var(--f-heading-xxl-bold);
				letter-spacing: var(--ls-heading-xxl, normal);
				line-height: 1;
			}

			small {
				font-size: 0.65em;
				font-weight: 600;
				color: var(--c-text-extra-light);
			}
		}

		.avg-returns dd {
			color: var(--c-bullish);
		}

		[slot='trigger'] {
			display: inline-flex;
			gap: 0.5ex;
			align-items: center;
		}

		[slot='popup'] {
			display: inline-block;
			max-width: 15rem;
		}
	}
</style>
