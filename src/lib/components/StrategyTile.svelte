<script>
	import Button from '$lib/components/Button.svelte';
	import ChartPlaceholder from '$lib/components/ChartPlaceholder.svelte';
</script>

<li class="strategy-tile">
	<div class="strategy-tile__thumbnail">
		<ChartPlaceholder />
	</div>
	<div class="strategy-tile__info">
		<h2 class="strategy-tile__title">Strategy name</h2>
		<div class="strategy-tile__indicators">
			<div class="strategy-tile__indicator projected-profit">
				<span> Projected profit </span>
				<span> ▲ 52.3% </span>
			</div>
			<div class="strategy-tile__indicator amount-of-assets">
				<span> Amount of assets </span>
				<span> $11.2k / 100k </span>
			</div>
		</div>
		<div class="strategy-tile__description">
			<p>Strategy description goes here. Try to be as descriptive and lean about it as possible.</p>
		</div>
		<Button tertiary lg>View strategy details</Button>
	</div>
</li>

<style>
	.strategy-tile {
		display: grid;
		border-radius: var(--border-radius-md);
		grid-template-columns: repeat(auto-fit, minmax(15rem, auto));
		list-style: none;
		max-height: 20rem;
		overflow: hidden;
	}

	.strategy-tile__thumbnail {
		display: grid;
		place-content: center;
		overflow: hidden;
	}

	.strategy-tile__info {
		padding: 1.5rem;
	}
</style>
