<script>
	/**
	 * @typedef {{label: string; value: string;}[]} StrategyOverviewSummaryItemDetails
	 * @property  details
	 * @property {string} title
	 */

	/**
	 * @typedef {object} StrategyOverviewSummaryItem
	 * @property {StrategyOverviewSummaryItemDetails} details
	 * @property {string} title
	 */

	/**
	 * @typedef {StrategyOverviewSummaryItem[]} StrategyOverviewSummaryItems
	 */

	/** @type {StrategyOverviewSummaryItems}*/

	import StrategyOverviewSummaryBox from './StrategyOverviewSummaryBox.svelte';

	export let items = [
		{
			title: 'Current',
			details: [
				{
					label: 'Value in trading positions',
					value: '$123'
				},
				{
					label: 'Cash',
					value: '$123'
				},
				{
					label: 'Last valuation',
					value: '12 minutes ago'
				}
			]
		},
		{
			title: 'Performance',
			details: [
				{
					label: 'Current profit',
					value: '$123'
				},
				{
					label: 'Unrealised profit',
					value: '$123'
				},
				{
					label: 'Realised profit',
					value: '$123'
				}
			]
		}
	];
</script>

<div>
	{#each items as item}
		<StrategyOverviewSummaryBox details={item.details} title={item.title} />
	{/each}
</div>

<style>
	div {
		display: grid;
		gap: 1.25rem;
		grid-template-columns: repeat(auto-fit, minmax(16rem, auto));
		padding-top: 1.25rem;
	}

	@media all and (max-width: 1024px) {
		div {
			gap: 1.5rem;
		}
	}
</style>
