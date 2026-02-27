<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import { formatAmount, formatDollar, formatPercent } from '$lib/helpers/formatters';
	import { calculateTotalTvl } from '$lib/top-vaults/helpers';
	import IconQuestionCircle from '~icons/local/question-circle';
	import Tooltip from '$lib/components/Tooltip.svelte';

	interface Props {
		baseVaults: VaultInfo[];
		rankedVaults: VaultInfo[];
	}

	let { baseVaults, rankedVaults }: Props = $props();

	let totalTvl = $derived(calculateTotalTvl(baseVaults));
	let formattedTvl = $derived(formatDollar(totalTvl).split(/(?=[KMBT])/));

	let top100Apy = $derived.by(() => {
		const top100Vaults = rankedVaults.slice(0, 100);
		const top100Tvl = calculateTotalTvl(top100Vaults);

		return top100Vaults.reduce((acc, v) => {
			const weight = v.current_nav! / top100Tvl;
			return acc + weight * (v.one_month_cagr_net ?? v.one_month_cagr ?? 0);
		}, 0);
	});
</script>

<dl class="vault-summary-metrics ds-3">
	<div>
		<dt>Vaults tracked</dt>
		<dd>
			{formatAmount(baseVaults.length)}
		</dd>
	</div>
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
				<span slot="popup"> Weighted averaged of the top 100 vaults with minumum $50k TVL.</span>
			</Tooltip>
		</dt>
		<dd>
			{formatPercent(top100Apy).slice(0, -1)}
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
