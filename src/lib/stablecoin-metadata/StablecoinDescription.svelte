<!--
@component
Expandable description widget for stablecoin detail pages. Displays short description
with optional expandable long description and external links (homepage, Twitter, CoinGecko, DefiLlama).

@example
```svelte
  <StablecoinDescription metadata={stablecoinMetadata} />
```
-->
<script lang="ts">
	import { slide } from 'svelte/transition';
	import { micromark } from 'micromark';
	import type { StablecoinMetadata } from './schemas';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import Button from '$lib/components/Button.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import { getStablecoinCoingeckoLink, getStablecoinNativeRate, isStablecoinDepegged } from './helpers';
	import IconTwitter from '~icons/local/twitter';
	import IconHome from '~icons/local/home';
	import IconExternalLink from '~icons/local/external-link';

	interface Props {
		metadata: StablecoinMetadata;
	}

	let { metadata }: Props = $props();

	let expanded = $state(false);

	let coingeckoHref = $derived(getStablecoinCoingeckoLink(metadata));
	let rateTimestamp = $derived(metadata.usd_rate_updated_at ?? metadata.usd_rate_fetched_at);
	let usdRateTimestamp = $derived(metadata.usd_rate_fetched_at ?? metadata.usd_rate_updated_at);
	let depegged = $derived(isStablecoinDepegged(metadata));
	let rateCurrency = $derived(metadata.peg_rate_currency ?? 'usd');
	let isNonUsdRate = $derived(rateCurrency.toLowerCase() !== 'usd');

	function formatRate(rate: number, currency: string) {
		try {
			return new Intl.NumberFormat('en', {
				style: 'currency',
				currency,
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}).format(rate);
		} catch {
			return `${new Intl.NumberFormat('en', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2
			}).format(rate)} ${currency.toUpperCase()}`;
		}
	}

	let formattedExchangeRate = $derived.by(() => {
		const nativeRate = getStablecoinNativeRate(metadata);
		if (nativeRate === undefined) return undefined;

		return formatRate(nativeRate, rateCurrency);
	});
	let formattedUsdExchangeRate = $derived.by(() => {
		const usdRate = metadata.usd_rate;
		if (!isNonUsdRate || typeof usdRate !== 'number' || !Number.isFinite(usdRate)) return undefined;

		return formatRate(usdRate, 'usd');
	});

	let hasExpandableContent = $derived(
		metadata.long_description && metadata.long_description !== metadata.short_description
	);

	let links = $derived(
		[
			{ href: metadata.links.homepage, label: 'Homepage', Icon: IconHome },
			{ href: metadata.links.twitter, label: 'Twitter', Icon: IconTwitter },
			{ href: coingeckoHref, label: 'CoinGecko', Icon: IconExternalLink },
			{ href: metadata.links.defillama, label: 'DefiLlama', Icon: IconExternalLink }
		].filter((link) => link.href)
	);
</script>

<div class="stablecoin-description">
	<MetricsBox title="About {metadata.name}">
		<div class="description-text">
			<p>{metadata.short_description}</p>
			{#if hasExpandableContent}
				<Button ghost class="toggle-btn" on:click={() => (expanded = !expanded)}>
					{expanded ? 'View less' : 'View more'}
				</Button>
			{/if}
		</div>

		{#if formattedExchangeRate || formattedUsdExchangeRate || coingeckoHref}
			<div class="rate-details" class:depegged>
				{#if formattedExchangeRate}
					<div class="rate">
						<span class="label">Stablecoin price</span>
						<span class="value">1 {metadata.symbol} = {formattedExchangeRate}</span>
						{#if rateTimestamp}
							<span class="timestamp">
								<Timestamp date={rateTimestamp} relative={{ strict: true }}>
									{#snippet children({ dateStr, relativeStr })}
										Fetched {dateStr} ({relativeStr})
									{/snippet}
								</Timestamp>
							</span>
						{/if}
					</div>
				{/if}

				{#if formattedUsdExchangeRate}
					<div class="rate">
						<span class="label">USD exchange rate</span>
						<span class="value">1 {metadata.symbol} = {formattedUsdExchangeRate}</span>
						{#if usdRateTimestamp}
							<span class="timestamp">
								<Timestamp date={usdRateTimestamp} relative={{ strict: true }}>
									{#snippet children({ dateStr, relativeStr })}
										Fetched {dateStr} ({relativeStr})
									{/snippet}
								</Timestamp>
							</span>
						{/if}
					</div>
				{/if}

				{#if coingeckoHref}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a class="coingecko-link" href={coingeckoHref} target="_blank" rel="noreferrer">
						<IconExternalLink --icon-size="1rem" />
						<span>CoinGecko</span>
					</a>
				{/if}
			</div>
		{/if}

		{#if expanded}
			<div transition:slide>
				<div class="long-description">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html micromark(metadata.long_description!)}
				</div>

				{#if links.length > 0}
					<div class="links">
						{#each links as { href, label, Icon } (label)}
							<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
							<a {href} target="_blank" rel="noreferrer">
								<Icon --icon-size="1rem" />
								<span>{label}</span>
							</a>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
	</MetricsBox>
</div>

<style>
	.stablecoin-description {
		display: contents;
		font: var(--f-ui-md-roman);
		color: var(--c-text-light);

		.description-text {
			display: flex;
			flex-wrap: wrap;
			align-items: baseline;
			gap: 1rem;

			p {
				margin: 0;
			}
		}

		.rate-details {
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: 0.75rem 1rem;
			margin-top: 1rem;
			padding-top: 1rem;
			border-top: 1px solid var(--c-box-3);

			&.depegged {
				.value {
					color: var(--c-bearish);
				}
			}
		}

		.rate {
			display: flex;
			flex-wrap: wrap;
			align-items: baseline;
			gap: 0.5rem;
		}

		.label,
		.timestamp {
			color: var(--c-text-extra-light);
			font: var(--f-ui-sm-roman);
		}

		.value {
			color: var(--c-text);
			font: var(--f-ui-md-medium);
		}

		.coingecko-link {
			display: inline-flex;
			align-items: center;
			gap: 0.4rem;
			color: var(--c-text-light);
			font: var(--f-ui-sm-medium);
			text-decoration: none;
			transition: color var(--time-sm);

			&:hover {
				color: var(--c-text);
			}
		}

		:global(.toggle-btn) {
			color: var(--c-text-extra-light);

			&:hover {
				color: var(--c-text);
			}
		}

		.long-description {
			margin-bottom: 1.5rem;

			:global(p) {
				margin-block: 1em;

				&:last-child {
					margin-bottom: 0;
				}
			}

			:global(a) {
				color: var(--c-text);
				text-decoration: underline;
			}

			:global(ul),
			:global(ol) {
				margin: 0 0 1em;
				padding-left: 1.5em;
			}

			:global(li) {
				margin-bottom: 0.25em;
			}

			:global(strong) {
				font-weight: 600;
			}

			:global(code) {
				font-family: var(--ff-mono);
				background: var(--c-box-2);
				padding: 0.125em 0.25em;
				border-radius: var(--radius-xs);
			}
		}

		.links {
			display: flex;
			flex-wrap: wrap;
			gap: 1rem;

			a {
				display: inline-flex;
				align-items: center;
				gap: 0.5em;
				font: var(--f-ui-sm-medium);
				color: var(--c-text-extra-light);
				text-decoration: none;
				transition: color var(--time-sm);

				&:hover {
					color: var(--c-text);
				}
			}
		}
	}
</style>
