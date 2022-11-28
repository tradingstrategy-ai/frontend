<script lang="ts">
	import { Button, ChartPlaceholder } from '$lib/components';

	export let id: string;
	export let name: string | undefined;
	export let description: string | undefined;
	export let error: string | undefined = undefined;

	export let isLossy = false;
	export let isProfitable = true;
</script>

<li class="strategy-tile" style={isProfitable ? '--profitable: initial;' : isLossy ? '--lossy: initial;' : ''}>
	<div class="strategy-tile__thumbnail">
		<ChartPlaceholder />
	</div>
	<div class="strategy-tile__info">
		<div class="strategy-tile__details">
			<h2 class="strategy-tile__title">{name}</h2>
			<div class="strategy-tile__indicators">
				<div class="strategy-tile__indicator projected-profit">
					<span class="strategy-tile__indicator-name"> Projected profit </span>
					<span class="strategy-tile__indicator-value --"> ▲ 52.3% </span>
				</div>
				<div class="strategy-tile__indicator amount-of-assets">
					<span class="strategy-tile__indicator-name"> Amount of assets </span>
					<span class="strategy-tile__indicator-value"> $11.2k / 100k </span>
				</div>
			</div>
			<div class="strategy-tile__description">
				<p>{description}</p>
			</div>
		</div>
		<Button href="/strategies/{id}" tertiary lg disabled={!!error}>View strategy details</Button>
	</div>
</li>

<style>
	.strategy-tile {
		--profitable: ;
		--lossy: ;
		display: grid;
		background: var(--c-background-5);
		border-radius: var(--strategy-tile-border-radius, var(--border-radius-md));
		grid-template-columns: repeat(auto-fit, minmax(18rem, auto));
		grid-auto-rows: subgrid;
		list-style: none;
		overflow: hidden;
	}

	.strategy-tile__thumbnail {
		align-items: center;
		display: flex;
		justify-content: center;
		overflow: hidden;
	}

	.strategy-tile__thumbnail :global(.chart-placeholder) {
		object-fit: cover;
		width: 100%;
		height: min(32rem, 100%);
	}

	.strategy-tile__info {
		display: grid;
		gap: var(--strategy-tile-info-gap, 1.5rem);
		padding: 1.5rem;
	}

	.strategy-tile__details {
		display: grid;
		gap: var(--strategy-tile-details-gap, 1rem);
	}

	.strategy-tile__title {
		font: var(--fs-ui-xxl);
		font-weight: 500;
	}

	.strategy-tile__indicators {
		display: grid;
		grid-template-columns: auto auto;
	}

	.strategy-tile__indicator {
		display: grid;
		gap: 0.5rem;
	}

	.strategy-tile__indicator-name {
		font: var(--fs-ui-sm);
		font-weight: 500;
	}

	.strategy-tile__indicator-value {
		font: var(--fs-ui-xl);
		font-weight: 500;
	}

	.projected-profit .strategy-tile__indicator-value {
		color: var(--lossy, var(--c-bearish)) var(--profitable, var(--c-bullish));
	}
</style>
