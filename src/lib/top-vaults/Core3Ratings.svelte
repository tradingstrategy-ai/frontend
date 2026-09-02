<!--
@component
Displays the third-party CORE3 protocol risk rating for a protocol. The rating is
protocol-level, so it applies to every vault on that protocol. Used on both the
individual vault detail page and the protocol listing page; only render it when
the protocol actually has a CORE3 rating.

The compact header carries the provider logo, rating grade and a disclosure.
The disclosure contains the protocol-level rating summary and its supporting
metrics.

Pass `protocolSlug` to link the protocol name to its page (e.g. from a vault
page); omit it on the protocol page itself to render the name as plain text.

@example

```svelte
  <Core3Ratings {core3} protocolName="Morpho" protocolSlug="morpho" />
```
-->
<script lang="ts">
	import type { Core3Protocol } from '$lib/top-vaults/schemas';
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import {
		CORE3_METHODOLOGY_URL,
		getCore3CategoryScores,
		getCore3RankingUrl,
		getCore3RatingTone,
		getCore3ReportUrl
	} from '$lib/top-vaults/helpers';
	import { formatDollar, formatNumber } from '$lib/helpers/formatters';
	import { riskRatingProviders } from './risk-rating-providers';
	import { resolve } from '$app/paths';
	import IconQuestionCircle from '~icons/local/question-circle';
	import IconChevronDown from '~icons/local/chevron-down';

	interface Props {
		core3: Core3Protocol;
		/** Protocol display name shown in the intro */
		protocolName: string;
		/** When provided, the protocol name links to the protocol page; omit on the protocol page itself */
		protocolSlug?: string;
		/** Vault pages need copy that explains the protocol-level nature of the score */
		context?: 'protocol' | 'vault';
	}

	let { core3, protocolName, protocolSlug, context = 'protocol' }: Props = $props();

	let rating = $derived(core3.pol?.rating ?? null);
	let ratingTone = $derived(getCore3RatingTone(rating));

	let reportUrl = $derived(getCore3ReportUrl(core3));
	let rankingUrl = $derived(getCore3RankingUrl(core3));
	let dataCoverage = $derived(core3.data_coverage?.percentage);
	let marketCap = $derived(core3.market_cap?.in_usd);

	// Per-category risk sub-scores (Security, Financial, …); empty for the
	// compact per-vault CORE3 fallback that carries only the headline score.
	let categoryScores = $derived(getCore3CategoryScores(core3));

	// Each category meter is a row of dots; each dot represents 10 risk points.
	const meterDotIndices = Array.from({ length: 10 }, (_, i) => i);
</script>

{#snippet ratingHeader()}
	<img class="provider-icon" src={riskRatingProviders.core3.logoUrl} alt={riskRatingProviders.core3.logoAlt} />
	<h2>CORE3 risk rating</h2>
	{#if rating}
		<div class="grade" data-tone={ratingTone}>{rating}</div>
	{/if}
{/snippet}

<MetricsBox class="core3-ratings">
	<details class="rating-fold">
		<summary class="box-header">
			{@render ratingHeader()}
			<span class="toggle">
				<span class="view-more">View more</span>
				<span class="view-less">View less</span>
				<IconChevronDown />
			</span>
		</summary>

		<div class="content">
			<p class="intro">
				Risk rating by CORE3 for {#if protocolSlug}<a href={resolve(`/vaults/protocols/${protocolSlug}`)}
						>{protocolName}</a
					>{:else}{protocolName}{/if}.
				{#if context === 'vault'}
					CORE3's Probability of Loss is a protocol-level risk measure. It does not assess the performance of this
					individual vault.
				{:else}
					The rating applies to all vaults on this protocol.
				{/if}
			</p>

			<div class="rating-details-content">
				<div class="columns">
					<table class="data">
						<tbody>
							{#if core3.pol?.score != null}
								<tr>
									<th>
										<Tooltip>
											<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
											<a
												slot="trigger"
												class="metric-link"
												href={CORE3_METHODOLOGY_URL}
												target="_blank"
												rel="noreferrer"
											>
												Probability of Loss
												<IconQuestionCircle />
											</a>
											<svelte:fragment slot="popup">
												<p>
													CORE3's Probability of Loss (PoL) estimates how likely users or token holders are to suffer a
													financially material loss, excluding market price moves.
												</p>
												<p>
													Scores run from 0 to 100, where lower scores indicate lower risk.
													<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
													<a href={CORE3_METHODOLOGY_URL} target="_blank" rel="noreferrer"
														>Read the CORE3 methodology.</a
													>
												</p>
											</svelte:fragment>
										</Tooltip>
									</th>
									<td>{formatNumber(core3.pol.score, 2, 2)}</td>
								</tr>
							{/if}
							{#if core3.pol?.confidence}
								<tr>
									<th>Confidence</th>
									<td>{core3.pol.confidence}</td>
								</tr>
							{/if}
							{#if core3.rank != null}
								<tr>
									<th>
										<Tooltip>
											<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
											<a slot="trigger" class="metric-link" href={rankingUrl} target="_blank" rel="noreferrer">
												CORE3 rank
												<IconQuestionCircle />
											</a>
											<svelte:fragment slot="popup">
												Where this protocol ranks among all DeFi protocols rated by CORE3, ordered by risk (1 = best).
												Opens the CORE3 ranking page.
											</svelte:fragment>
										</Tooltip>
									</th>
									<td>#{core3.rank}</td>
								</tr>
							{/if}
						</tbody>
					</table>

					<table class="data">
						<tbody>
							{#if dataCoverage != null}
								<tr>
									<th>Data coverage</th>
									<td>{formatNumber(dataCoverage, 1, 1)}%</td>
								</tr>
							{/if}
							{#if core3.category?.name}
								<tr>
									<th>Category</th>
									<td>{core3.category.name}</td>
								</tr>
							{/if}
							{#if marketCap}
								<tr>
									<th>Market cap</th>
									<td>{formatDollar(marketCap, 1, 1, { notation: 'compact' })}</td>
								</tr>
							{/if}
						</tbody>
					</table>
				</div>

				{#if categoryScores.length}
					<section class="scorecard">
						<h3>Risk score by category</h3>
						<p class="scorecard-note">Sub-scores run 0–100 — lower is better.</p>
						<ul class="scores">
							{#each categoryScores as cat (cat.key)}
								<li>
									<span class="label">{cat.label}</span>
									<span class="value">{formatNumber(cat.score, 0, 0)}</span>
									<span
										class="meter"
										data-tone={cat.tone}
										role="meter"
										aria-valuemin="0"
										aria-valuemax="100"
										aria-valuenow={cat.score}
										aria-label="{cat.label} risk score {formatNumber(cat.score, 0, 0)} out of 100"
									>
										{#each meterDotIndices as i (i)}
											<span class="dot" style="--frac: {Math.min(Math.max(cat.score / 10 - i, 0), 1)}"></span>
										{/each}
									</span>
								</li>
							{/each}
						</ul>
					</section>
				{/if}

				{#if reportUrl}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a class="full-rating-link" href={reportUrl} target="_blank" rel="noreferrer"
						>View full rating on the CORE3 website</a
					>
				{/if}
			</div>
		</div>
	</details>
</MetricsBox>

<style>
	.content {
		display: grid;
		gap: 1.25rem;
		/* The provider mark makes the disclosure header taller than text alone.
		   Keep its opened copy at the same comfortable distance as Xerberus. */
		margin-top: 1.25rem;
	}

	.box-header {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		cursor: pointer;
		list-style: none;

		&::-webkit-details-marker {
			display: none;
		}

		.provider-icon {
			width: 2.5rem;
			height: 2.5rem;
			border-radius: var(--radius-sm);
			object-fit: contain;
		}

		h2 {
			flex: 1;
			min-width: 0;
			margin: 0;
			font: var(--f-ui-sm-bold);
			font-size: 1rem;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			color: var(--c-text-light);

			@media (--viewport-sm-down) {
				font-size: 0.875rem;
			}
		}

		.toggle {
			margin-left: auto;
			display: inline-flex;
			align-items: center;
			gap: 0.25rem;
			font: var(--f-ui-sm-medium);
			color: var(--c-text-light);
			text-decoration: underline;
			white-space: nowrap;

			:global(.icon) {
				transition: rotate 0.15s ease;
			}
		}
	}

	.rating-fold[open] .toggle :global(.icon) {
		rotate: 180deg;
	}

	.view-less {
		display: none;
	}

	.rating-fold[open] {
		.view-more {
			display: none;
		}

		.view-less {
			display: inline;
		}
	}

	/* Shared risk-tone colour for the grade badge and the category meters. */
	.grade,
	.meter {
		--c-tone: var(--c-text-light);

		&[data-tone='excellent'] {
			--c-tone: var(--c-success);
		}
		&[data-tone='good'] {
			--c-tone: color-mix(in srgb, var(--c-success), var(--c-warning));
		}
		&[data-tone='fair'] {
			--c-tone: var(--c-warning);
		}
		&[data-tone='poor'] {
			--c-tone: var(--c-error);
		}
	}

	.grade {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		min-width: 3.25rem;
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-md);
		border: 2px solid color-mix(in srgb, var(--c-tone), transparent 55%);
		background: color-mix(in srgb, var(--c-tone), transparent 88%);
		font: var(--f-heading-md-medium);
		color: color-mix(in srgb, var(--c-text), var(--c-tone) 80%);
	}

	.intro {
		margin: 0;
		font: var(--f-ui-md-roman);
		color: var(--c-text-extra-light);

		a {
			text-decoration: underline;
			font-weight: 500;
			color: var(--c-text-light);
		}
	}

	.full-rating-link {
		width: fit-content;
		font: var(--f-ui-md-medium);
		color: var(--c-text-light);
		text-decoration: underline;
	}

	.rating-details-content {
		display: grid;
		gap: 1.25rem;
		border-top: 1px solid var(--c-box-3);
		padding-top: 1.25rem;
	}

	.columns {
		display: grid;
		gap: var(--gap, 1.5rem);
		align-items: start;

		@media (--viewport-md-up) {
			grid-template-columns: 1fr 1fr;
		}
	}

	table.data {
		width: 100%;
		border-collapse: collapse;

		tr {
			border-top: 1px solid var(--c-box-3);

			&:first-child {
				border-top: none;
			}
		}

		th,
		td {
			padding: 0.625rem 0;
			font: var(--f-ui-md-roman);
			text-align: left;
		}

		th {
			color: var(--c-text-extra-light);
			font-weight: normal;
		}

		td {
			text-align: right;
			color: var(--c-text-light);
		}

		.metric-link {
			display: inline-flex;
			align-items: center;
			gap: 0.25rem;
			color: var(--c-text-light);
			text-decoration: underline;

			:global(.icon) {
				color: var(--c-text-extra-light);
			}
		}
	}

	.scorecard {
		border-top: 1px solid var(--c-box-3);
		padding-top: 1.25rem;

		h3 {
			margin: 0;
			font: var(--f-ui-sm-bold);
			font-size: 0.9375rem;
			letter-spacing: 0.04em;
			text-transform: uppercase;
			color: var(--c-text-light);
		}

		.scorecard-note {
			margin: 0.25rem 0 1rem;
			font: var(--f-ui-sm-roman);
			color: var(--c-text-extra-light);
		}
	}

	.scores {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.625rem;

		li {
			display: grid;
			grid-template-columns: minmax(6rem, auto) 2.25rem 1fr;
			align-items: center;
			gap: 0.875rem;
		}

		.label {
			font: var(--f-ui-md-roman);
			color: var(--c-text-extra-light);
		}

		.value {
			text-align: right;
			font: var(--f-ui-md-medium);
			font-variant-numeric: tabular-nums;
			color: var(--c-text-light);
		}
	}

	/* Dot meter — filled portion uses the category tone, empty portion is a faint
	   ring, echoing the CORE3 website's "lit/unlit" score meter. */
	.meter {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;

		.dot {
			width: 0.9rem;
			height: 0.9rem;
			border-radius: 50%;
			border: 1px solid color-mix(in srgb, var(--c-text), transparent 80%);
			background: linear-gradient(90deg, var(--c-tone) calc(var(--frac) * 100%), transparent calc(var(--frac) * 100%));
		}
	}

	@media (--viewport-sm-down) {
		.scores li {
			grid-template-columns: 1fr auto;
			column-gap: 0.75rem;
			row-gap: 0.375rem;
		}

		.scores .meter {
			grid-column: 1 / -1;
		}
	}

	@media (width <= 360px) {
		.box-header {
			display: grid;
			grid-template-columns: 2.5rem minmax(0, 1fr) auto;
			gap: 0.625rem;

			.toggle {
				grid-column: 2 / -1;
				justify-self: end;
				margin-left: 0;
			}
		}
	}

	/* Cap the CORE3 metric tooltips. */
	:global(.core3-ratings .tooltip .popup) {
		max-width: 400px;
	}

	:global(.core3-ratings .tooltip .popup p:last-child) {
		margin-bottom: 0;
	}
</style>
