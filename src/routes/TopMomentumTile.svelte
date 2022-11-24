<!--
@component
Display best or worst performing trading pairs.

#### Usage
```tsx
	<TopMomentumTile
		name="Most profitable 24h"
		pairs={[...]}
		linkTarget="/trading-view/top-list/daily-up"
		linkLabel="View all winning pairs"
	/>
```
-->
<script lang="ts">
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { Button } from '$lib/components';

	export let name: string;
	export let pairs: [];
	export let linkTarget: string;
	export let linkLabel: string;

	$: topPairs = pairs.slice(0, 5);

	function formatPriceChange(value: number): string {
		return Math.abs(value).toLocaleString('en-US', {
			style: 'percent',
			minimumFractionDigits: 1
		});
	}
</script>

<div data-testid="top-momentum">
	<h3>{name}</h3>
	<ul>
		{#each topPairs as pair}
			<li>
				<a href={`/trading-view/${pair.chain_slug}/${pair.exchange_slug}/${pair.pair_slug}`}>
					{pair.pair_symbol} on
					{pair.exchange_name}
				</a>
				<span class="price-change {determinePriceChangeClass(pair.price_change_24h)}">
					{formatPriceChange(pair.price_change_24h)}
				</span>
			</li>
		{/each}
	</ul>
	<span class="cta">
		<Button label={linkLabel} href={linkTarget} />
	</span>
</div>

<style lang="postcss">
	div {
		display: grid;
		border: 2px solid var(--c-border-2);
		border-radius: 0.5rem;
		padding: 1.5rem;

		@media (--viewport-md-up) {
			padding: 2rem;
		}
	}

	h3 {
		@media (--viewport-md-down) {
			text-align: center;
		}
	}

	ul {
		display: grid;
		gap: 1.5rem;
		width: 100%;
		margin: 2.5rem 0;
		padding: 0;
		list-style-type: none;

		& * {
			font: var(--f-ui-md-roman);
			letter-spacing: var(--f-ui-md-roman, normal);

			@media (--viewport-md-up) {
				font: var(--f-ui-xl-roman);
				letter-spacing: var(--f-ui-xl-roman, normal);
			}
		}
	}

	li {
		display: flex;
		white-space: nowrap;
		width: 100%;
		overflow: hidden;
	}

	a {
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;

		&:hover {
			text-decoration: underline;
		}
	}

	.price-change {
		font-weight: 500;
		margin-left: 1ex;
	}

	.price-change-green::before {
		margin-right: 0.5ex;
		content: '▲';
	}

	.price-change-red::before {
		margin-right: 0.5ex;
		content: '▼';
	}

	.cta {
		display: grid;

		@media (--viewport-md-up) {
			justify-content: center;
		}
	}
</style>
