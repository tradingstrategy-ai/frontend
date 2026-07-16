<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import type { Chain } from '$lib/helpers/chain';
	import { getExplorerUrl } from '$lib/helpers/chain';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import { CopyWidget, HashAddress, Timestamp, Tooltip } from '$lib/components';
	import { formatAmount, formatDollar, notFilledMarker } from '$lib/helpers/formatters';
	import { parseDate } from '$lib/helpers/date';
	import {
		getFeeModeLabel,
		getFeeModeDescription,
		getVaultDenominationUsdRate,
		getVaultDenominationCurrency,
		getVaultTvlNative
	} from '$lib/top-vaults/helpers';
	import {
		getStablecoinDetailsHref,
		getVaultDenominationLogoUrl,
		resolveStablecoinSlug
	} from '$lib/stablecoin-metadata/helpers';
	import type { StablecoinMetadata } from '$lib/stablecoin-metadata/schemas';
	import { getLogoUrl } from '$lib/helpers/assets';

	const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

	interface Props {
		vault: VaultInfo;
		chain: Chain;
		stablecoinMetadata?: StablecoinMetadata | null;
		generated_at?: string | Date | null;
	}

	let { vault, chain, stablecoinMetadata = null, generated_at = null }: Props = $props();

	let copyWidget = $state<CopyWidget>();
	let denominationSlug = $derived(
		resolveStablecoinSlug({
			slug: vault.denomination_slug,
			symbol: vault.denomination,
			name: vault.normalised_denomination
		})
	);
	let denominationLinkLabel = $derived.by(() => {
		const symbol = stablecoinMetadata?.symbol ?? vault.denomination;
		const fullName = stablecoinMetadata?.name ?? vault.normalised_denomination ?? symbol;

		if (!fullName || fullName === symbol) return symbol;

		return `${fullName} (${symbol})`;
	});
	let denominationCurrency = $derived(getVaultDenominationCurrency(vault));
	let nativeCurrencySymbol = $derived(denominationCurrency?.toUpperCase());
	let showNativeTvlRows = $derived(denominationCurrency != null && denominationCurrency !== 'usd');
	let lifetimePeriod = $derived(vault.period_results?.find((p) => p.period.toLowerCase() === 'lifetime') ?? null);
	let denominationPageSlug = $derived(denominationSlug ?? vault.denomination_slug);
	let denominationLogoUrl = $derived(getVaultDenominationLogoUrl(vault, denominationSlug));
	let denominationHref = $derived(stablecoinMetadata ? getStablecoinDetailsHref(denominationSlug) : undefined);
	let showExchangeRateRow = $derived(vault.protocol_slug !== 'kinexys');
	let exchangeRateFetchedAt = $derived(
		vault.denomination_token_rate?.usd_rate_fetched_at ??
			vault.denomination_token_rate?.source_currency_usd_rate_fetched_at ??
			null
	);

	let lastUpdatedStale = $derived.by(() => {
		const lastUpdated = parseDate(vault.last_updated_at);
		if (!lastUpdated) return false;
		return Date.now() - lastUpdated.getTime() > THREE_DAYS_MS;
	});

	const rows = $derived([
		{ label: 'Vault name', value: vault.name },
		{ label: 'Vault address', value: vault.address, type: 'address' as const },
		{ label: 'Chain', value: chain, type: 'chain' as const },
		{
			label: 'Denomination',
			value: {
				name: denominationLinkLabel,
				slug: denominationSlug ?? vault.denomination_slug,
				address: vault.denomination_token_address,
				logoUrl: denominationLogoUrl,
				href: denominationHref
			},
			type: 'denomination' as const
		},
		...(showExchangeRateRow
			? [
					{
						label: 'Exchange rate used',
						value: {
							usdRate: getVaultDenominationUsdRate(vault),
							symbol: vault.denomination,
							slug: denominationPageSlug,
							fetchedAt: exchangeRateFetchedAt,
							href: getStablecoinDetailsHref(denominationPageSlug)
						},
						type: 'exchangeRate' as const
					}
				]
			: []),
		{
			label: 'Share token',
			value: { name: vault.share_token, address: vault.share_token_address },
			type: 'token' as const
		},
		{
			label: 'Protocol',
			value: { name: vault.protocol, slug: vault.protocol_slug },
			type: 'protocol' as const
		},
		{
			label: 'Homepage',
			value: { url: vault.link, hasProtocol: !(vault.link || '').includes('routescan') },
			type: 'link' as const
		},
		{
			label: 'Current <a href="/glossary/total-value-locked-tvl">TVL</a>',
			value: { amount: vault.current_nav, symbol: vault.denomination },
			type: 'currency' as const
		},
		{
			label: 'Peak <a href="/glossary/total-value-locked-tvl">TVL</a>',
			value: { amount: vault.peak_nav, symbol: vault.denomination },
			type: 'currency' as const
		},
		...(showNativeTvlRows && nativeCurrencySymbol
			? [
					{
						label: `TVL low (${nativeCurrencySymbol})`,
						value: {
							amount: getVaultTvlNative(vault, lifetimePeriod?.tvl_low ?? null),
							symbol: nativeCurrencySymbol
						},
						type: 'currency' as const
					},
					{
						label: `TVL high (${nativeCurrencySymbol})`,
						value: {
							amount: getVaultTvlNative(vault, lifetimePeriod?.tvl_high ?? null),
							symbol: nativeCurrencySymbol
						},
						type: 'currency' as const
					}
				]
			: []),
		{
			label: 'Last share price',
			value: { amount: vault.last_share_price, symbol: vault.denomination },
			type: 'currency' as const
		},
		{ label: 'Last updated', value: vault.last_updated_at, type: 'relativeDate' as const },
		{ label: 'Last updated block', value: vault.last_updated_block, type: 'number' as const },
		{ label: 'Data refreshed at', value: generated_at, type: 'relativeDate' as const },

		{ label: 'Data starts', value: vault.start_date, type: 'date' as const },
		{
			label: 'Fee mode',
			value: getFeeModeLabel(vault.fee_mode),
			tooltip: getFeeModeDescription(vault.fee_mode)
		},
		{ label: 'Fees internalised', value: vault.fee_internalised, type: 'boolean' as const },
		{ label: 'Features', value: vault.features, type: 'array' as const },
		{ label: 'Flags', value: vault.flags, type: 'array' as const },
		{ label: 'Deposit status', value: vault.deposit_closed_reason, type: 'closedReason' as const },
		{ label: 'Redemption status', value: vault.redemption_closed_reason, type: 'closedReason' as const },
		// The API uses 0 to mean deposit/redemption event counts are not tracked for this vault.
		...(vault.event_count !== 0
			? [{ label: 'Deposit/redemption events', value: vault.event_count, type: 'number' as const }]
			: [])
	]);

	function formatValue(value: unknown, type?: string): string {
		if (value === null || value === undefined) return notFilledMarker;

		switch (type) {
			case 'date':
				return String(value).replace('T', ' ') + ' UTC';
			case 'number':
				return formatAmount(value as number);
			case 'boolean':
				return value ? 'Yes' : 'No';
			case 'array':
				return (value as string[]).length > 0 ? (value as string[]).join(', ') : notFilledMarker;
			default:
				return String(value);
		}
	}

	function formatExchangeRate(usdRate: number | null | undefined, symbol: string): string {
		if (usdRate == null) return notFilledMarker;
		return `1 ${symbol} = ${formatDollar(usdRate, 4, 6)}`;
	}
</script>

<MetricsBox title="Technical Details">
	<div class="table-wrapper">
		<table class="details-table">
			<tbody>
				{#each rows as row}
					<tr>
						<td class="label">{@html row.label}</td>
						<td class="value">
							{#if row.type === 'address'}
								<span class="address-cell">
									<a href={getExplorerUrl(chain, row.value)} target="_blank" rel="noreferrer">
										<HashAddress address={row.value} endChars={7} />
									</a>
									<button title="Copy to clipboard" onclick={() => copyWidget?.copy(row.value)}>
										<CopyWidget bind:this={copyWidget} />
									</button>
								</span>
							{:else if row.type === 'chain'}
								<a class="chain-link" href="/trading-view/vaults/chains/{row.value.slug}">
									<img class="chain-logo" src={getLogoUrl('blockchain', row.value.slug)} alt="" />
									{row.value.name} ({row.value.id})
								</a>
							{:else if row.type === 'denomination'}
								{#if row.value.address}
									<Tooltip>
										<span slot="trigger">
											{#if row.value.href}
												<a class="denomination-link tooltip-hint" href={row.value.href}>
													{#if row.value.logoUrl}
														<img class="denomination-logo" src={row.value.logoUrl} alt="" />
													{/if}
													{row.value.name}
												</a>
											{:else}
												<span class="denomination-link tooltip-hint">
													{#if row.value.logoUrl}
														<img class="denomination-logo" src={row.value.logoUrl} alt="" />
													{/if}
													{row.value.name}
												</span>
											{/if}
										</span>
										<svelte:fragment slot="popup">
											<a
												class="tooltip-link"
												href={getExplorerUrl(chain, row.value.address)}
												target="_blank"
												rel="noreferrer"
											>
												View on blockchain explorer: <HashAddress address={row.value.address} endChars={7} />
											</a>
										</svelte:fragment>
									</Tooltip>
								{:else if row.value.href}
									<a class="denomination-link" href={row.value.href}>
										{#if row.value.logoUrl}
											<img class="denomination-logo" src={row.value.logoUrl} alt="" />
										{/if}
										{row.value.name}
									</a>
								{:else}
									<span class="denomination-link">
										{#if row.value.logoUrl}
											<img class="denomination-logo" src={row.value.logoUrl} alt="" />
										{/if}
										{row.value.name}
									</span>
								{/if}
							{:else if row.type === 'exchangeRate'}
								{#if row.value.usdRate != null}
									<span class="exchange-rate-cell">
										{#if row.value.href}
											<a href={row.value.href}>{formatExchangeRate(row.value.usdRate, row.value.symbol)}</a>
										{:else}
											{formatExchangeRate(row.value.usdRate, row.value.symbol)}
										{/if}
										{#if row.value.fetchedAt}
											<span class="secondary">
												fetched <Timestamp date={row.value.fetchedAt} relative />
											</span>
										{/if}
									</span>
								{:else}
									{notFilledMarker}
								{/if}
							{:else if row.type === 'token'}
								{#if row.value.address}
									<Tooltip>
										<span slot="trigger" class="tooltip-hint">{row.value.name}</span>
										<svelte:fragment slot="popup">
											<a
												class="tooltip-link"
												href={getExplorerUrl(chain, row.value.address)}
												target="_blank"
												rel="noreferrer"
											>
												View on blockchain explorer: <HashAddress address={row.value.address} endChars={7} />
											</a>
										</svelte:fragment>
									</Tooltip>
								{:else}
									{row.value.name}
								{/if}
							{:else if row.type === 'protocol'}
								<a href="/trading-view/vaults/protocols/{row.value.slug}">{row.value.name}</a>
							{:else if row.type === 'currency'}
								{row.value.amount != null ? `${formatAmount(row.value.amount)} ${row.value.symbol}` : notFilledMarker}
							{:else if row.type === 'link'}
								{#if row.value.url}
									<a href={row.value.url} target="_blank" rel="noreferrer">
										{row.value.hasProtocol ? 'View vault on protocol website' : 'View vault on blockchain explorer'}
									</a>
								{:else}
									{notFilledMarker}
								{/if}
							{:else if row.type === 'closedReason'}
								{#if row.value}
									<span class="closed-status">{row.value}</span>
								{:else}
									<span class="open-status">Open</span>
								{/if}
							{:else if row.type === 'relativeDate'}
								{#if row.value}
									{#if lastUpdatedStale}
										<Tooltip>
											<span slot="trigger" class="stale-date">
												<Timestamp date={row.value} withTime relative>
													{#snippet children({ dateStr, timeStr, relativeStr })}
														{dateStr} {timeStr} UTC ({relativeStr})
													{/snippet}
												</Timestamp>
											</span>
											<svelte:fragment slot="popup">
												Currently we do not have latest data on this vault, likely due to infrastructure issues.
											</svelte:fragment>
										</Tooltip>
									{:else}
										<Timestamp date={row.value} withTime relative>
											{#snippet children({ dateStr, timeStr, relativeStr })}
												{dateStr} {timeStr} UTC ({relativeStr})
											{/snippet}
										</Timestamp>
									{/if}
								{:else}
									{notFilledMarker}
								{/if}
							{:else if row.tooltip}
								<Tooltip>
									<span slot="trigger" class="tooltip-hint">{formatValue(row.value, row.type)}</span>
									<svelte:fragment slot="popup">{row.tooltip}</svelte:fragment>
								</Tooltip>
							{:else}
								{formatValue(row.value, row.type)}
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</MetricsBox>

<style>
	.table-wrapper {
		overflow-x: auto;
	}

	.details-table {
		width: 100%;
		border-collapse: collapse;
		font: var(--f-ui-md-roman);

		@media (--viewport-sm-down) {
			font: var(--f-ui-sm-roman);
		}

		tr {
			border-bottom: 1px solid var(--c-box-3);

			&:last-child {
				border-bottom: none;
			}
		}

		td {
			padding: 0.5rem 0;

			@media (--viewport-sm-down) {
				padding: 0.375rem 0;
			}
		}

		.label {
			font-weight: bold;
			color: var(--c-text);
			white-space: nowrap;
			width: 15%;
			padding-right: 1rem;

			:global(a) {
				text-decoration: underline;
				text-decoration-style: dashed;
			}
		}

		.value {
			color: var(--c-text-light);
			word-break: break-word;

			a {
				text-decoration: underline;
				text-decoration-style: dashed;
			}
		}
	}

	.address-cell {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;

		button {
			border: none;
			padding: 0;
			background: none;
			cursor: pointer;
		}
	}

	.tooltip-hint {
		text-decoration: underline;
		text-decoration-style: dashed;
		cursor: help;
	}

	.tooltip-link {
		display: block;
		text-decoration: underline !important;
		text-decoration-style: solid !important;
		text-decoration-skip-ink: none;
	}

	.stale-date {
		color: var(--c-error);
		border-bottom: 1px dotted var(--c-error);
	}

	.closed-status {
		color: var(--c-error);
	}

	.open-status {
		color: var(--c-success);
	}

	.denomination-link,
	.chain-link {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
	}

	.exchange-rate-cell {
		display: inline-flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.4rem;
	}

	.secondary {
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-roman);
	}

	.denomination-logo,
	.chain-logo {
		width: 1.2em;
		height: 1.2em;
		border-radius: 999px;
		object-fit: contain;
	}
</style>
