<script lang="ts">
	import { Button, ChartPlaceholder } from '$lib/components';

	export let id: string;
	export let name: string | undefined;
	export let description: string | undefined;
	export let error: string | undefined = undefined;

	export let isLossy = false;
	export let isProfitable = true;
</script>

<li style={isProfitable ? '--profitable: initial;' : isLossy ? '--lossy: initial;' : ''}>
	<div class="thumbnail">
		<ChartPlaceholder />
	</div>
	<div class="info">
		<div class="details">
			<h2 class="title">{name}</h2>
			<dl>
				<div class="projected-profit">
					<dt>Projected profit</dt>
					<dd>▲ 52.3%</dd>
				</div>
				<div class="amount-of-assets">
					<dt>Amount of assets</dt>
					<dd>$11.2k / 100k</dd>
				</div>
			</dl>
			<div class="description">
				{#if !error}
					<p>{description}</p>
				{:else}
					<p>Strategy data not currently available.</p>
				{/if}
			</div>
		</div>
		<Button href="/strategies/{id}" tertiary lg disabled={!!error}>View strategy details</Button>
	</div>
</li>

<style lang="postcss">
	li {
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

	.thumbnail {
		align-items: center;
		display: flex;
		justify-content: center;
		overflow: hidden;

		& :global .chart-placeholder {
			object-fit: cover;
			width: 100%;
			height: min(32rem, 100%);
		}
	}

	.info {
		display: grid;
		gap: var(--strategy-tile-info-gap, 1.5rem);
		padding: 1.5rem;
	}

	.details {
		display: grid;
		gap: var(--strategy-tile-details-gap, 1rem);
	}

	.title {
		font: var(--fs-ui-xxl);
		font-weight: 500;
	}

	dl {
		display: grid;
		grid-template-columns: auto auto;
		margin: 0;

		& > div {
			display: grid;
			gap: 0.5rem;
		}
	}

	dt {
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--f-ui-sm-spacing);
	}

	dd {
		font: var(--f-ui-xl-medium);
		letter-spacing: var(--f-ui-xl-spacing);
		margin: 0;
	}

	.projected-profit dd {
		color: var(--lossy, var(--c-bearish)) var(--profitable, var(--c-bullish));
	}
</style>
