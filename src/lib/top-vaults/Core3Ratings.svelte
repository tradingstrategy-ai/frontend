<!--
@component
Displays the third-party CORE3 protocol risk rating for a protocol. The rating is
protocol-level, so it applies to every vault on that protocol. Used on both the
individual vault detail page and the protocol listing page; only render it when
the protocol actually has a CORE3 rating.

The header carries the rating grade badge next to the title. Below, a two-column
layout shows the rating metrics (Probability of Loss, confidence, rank) on the left and
protocol context (data coverage, category, market cap) on the right.

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
	import type { Core3CategoryKey } from '$lib/top-vaults/helpers';
	import { formatDollar, formatNumber } from '$lib/helpers/formatters';
	import { resolve } from '$app/paths';
	import IconQuestionCircle from '~icons/local/question-circle';
	import IconChevronDown from '~icons/local/chevron-down';

	interface Props {
		core3: Core3Protocol;
		/** Protocol display name shown in the intro */
		protocolName: string;
		/** When provided, the protocol name links to the protocol page; omit on the protocol page itself */
		protocolSlug?: string;
		/** When true, the box collapses to just the grade and title with a "View more" toggle */
		collapsible?: boolean;
	}

	let { core3, protocolName, protocolSlug, collapsible = false }: Props = $props();

	let expanded = $state(false);
	// Collapsed: only render the grade + title summary, and the whole box opens it
	let collapsed = $derived(collapsible && !expanded);
	let boxClass = $derived(collapsed ? 'core3-ratings core3-collapsed' : 'core3-ratings');

	let rating = $derived(core3.pol?.rating ?? null);
	let ratingTone = $derived(getCore3RatingTone(rating));

	let reportUrl = $derived(getCore3ReportUrl(core3));
	let rankingUrl = $derived(getCore3RankingUrl(core3));
	let dataCoverage = $derived(core3.data_coverage?.percentage);
	let marketCap = $derived(core3.market_cap?.in_usd);

	// Per-category risk sub-scores (Security, Financial, …); empty for the
	// compact per-vault CORE3 fallback that carries only the headline score.
	let categoryScores = $derived(getCore3CategoryScores(core3));

	// Number of dots in each category meter; each dot represents 10 risk points.
	const METER_DOTS = 10;

	/** Append the per-category score to a tooltip weighting bullet, e.g. " (51)". */
	function categoryScoreSuffix(key: Core3CategoryKey): string {
		const score = core3.pol_categories?.[key];
		return score == null ? '' : ` (${formatNumber(score, 0, 0)})`;
	}
</script>

{#snippet ratingHeader()}
	{#if rating}
		<div class="grade" data-tone={ratingTone}>{rating}</div>
	{/if}
	<h2>CORE3 risk rating</h2>
{/snippet}

<MetricsBox class={boxClass}>
	{#if collapsed}
		<!-- Collapsed: the whole box is the toggle, so clicking anywhere opens it -->
		<button type="button" class="box-header collapsed-summary" aria-expanded="false" onclick={() => (expanded = true)}>
			{@render ratingHeader()}
			<span class="toggle" aria-hidden="true">View more <IconChevronDown /></span>
		</button>
	{:else}
		<div class="content">
			<header class="box-header">
				{@render ratingHeader()}
				{#if collapsible}
					<button type="button" class="toggle" aria-expanded="true" onclick={() => (expanded = false)}>
						View less <IconChevronDown />
					</button>
				{/if}
			</header>

			<p class="intro">
				Risk rating by CORE3 for {#if protocolSlug}<a href={resolve(`/trading-view/vaults/protocols/${protocolSlug}`)}
						>{protocolName}</a
					>{:else}{protocolName}{/if}. The rating applies to all vaults on this protocol.
				{#if reportUrl}
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={reportUrl} target="_blank" rel="noreferrer">View full rating on the CORE3 website</a>.
				{/if}
			</p>

			<div class="columns">
				<table class="data">
					<tbody>
						{#if core3.pol?.score != null}
							<tr>
								<th>
									<Tooltip>
										<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
										<a slot="trigger" class="metric-link" href={CORE3_METHODOLOGY_URL} target="_blank" rel="noreferrer">
											Probability of Loss
											<IconQuestionCircle />
										</a>
										<svelte:fragment slot="popup">
											<p>
												CORE3's Probability of Loss (PoL) estimates how likely users or token holders are to suffer a
												financially material loss, excluding market price moves.
											</p>
											<p>
												The scale runs 0–100 — lower is better — and maps to a letter grade from AA (lowest risk) down
												to D.
											</p>
											<p>
												It is a weighted aggregate of risk categories
												{#if categoryScores.length}(this protocol's sub-scores in brackets){/if}:
											</p>
											<ul>
												<li>Security — 35%{categoryScoreSuffix('security')}</li>
												<li>Operational — 20%{categoryScoreSuffix('operational')}</li>
												<li>Financial — 15%{categoryScoreSuffix('financial')}</li>
												<li>Reputational — 10%{categoryScoreSuffix('reputational')}</li>
												<li>Regulatory — 5%{categoryScoreSuffix('regulatory')}</li>
												<li>Dependency — 15% (coming soon)</li>
											</ul>
											<p>
												The total is then scaled by 1.0–1.3× for factors such as protocol longevity, past incidents and
												category leadership.
												<a href={CORE3_METHODOLOGY_URL} target="_blank" rel="noreferrer">Read CORE3 methodology</a>.
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
									{#each Array.from({ length: METER_DOTS }) as _, i (i)}
										<span class="dot" style="--frac: {Math.min(Math.max(cat.score / 10 - i, 0), 1)}"></span>
									{/each}
								</span>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		</div>
	{/if}
</MetricsBox>

<style>
	.content {
		display: grid;
		gap: 1.25rem;
	}

	.box-header {
		display: flex;
		align-items: center;
		gap: 0.875rem;

		h2 {
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
			padding: 0;
			border: none;
			background: none;
			cursor: pointer;
			font: var(--f-ui-sm-medium);
			color: var(--c-text-light);
			text-decoration: underline;
			white-space: nowrap;

			:global(.icon) {
				transition: rotate 0.15s ease;
			}

			&[aria-expanded='true'] :global(.icon) {
				rotate: 180deg;
			}
		}
	}

	/* When collapsed the whole box is one button: drop the MetricsBox padding so
	   the button fills the box edge-to-edge and the entire component is clickable */
	:global(.core3-ratings.core3-collapsed) {
		padding: 0;
	}

	.collapsed-summary {
		width: 100%;
		padding: var(--padding, 1.25rem);
		border: none;
		border-radius: var(--radius-md);
		background: none;
		text-align: left;
		color: inherit;
		cursor: pointer;

		&:hover .toggle {
			color: var(--c-text);
		}
	}

	.grade {
		--c-rating: var(--c-text-light);
		display: grid;
		place-items: center;
		min-width: 3.25rem;
		padding: 0.25rem 0.75rem;
		border-radius: var(--radius-md);
		border: 2px solid color-mix(in srgb, var(--c-rating), transparent 55%);
		background: color-mix(in srgb, var(--c-rating), transparent 88%);
		font: var(--f-heading-md-medium);
		color: color-mix(in srgb, var(--c-text), var(--c-rating) 80%);

		&[data-tone='excellent'] {
			--c-rating: var(--c-success);
		}
		&[data-tone='good'] {
			--c-rating: color-mix(in srgb, var(--c-success), var(--c-warning));
		}
		&[data-tone='fair'] {
			--c-rating: var(--c-warning);
		}
		&[data-tone='poor'] {
			--c-rating: var(--c-error);
		}
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
		--c-meter: var(--c-text-light);
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;

		&[data-tone='excellent'] {
			--c-meter: var(--c-success);
		}
		&[data-tone='good'] {
			--c-meter: color-mix(in srgb, var(--c-success), var(--c-warning));
		}
		&[data-tone='fair'] {
			--c-meter: var(--c-warning);
		}
		&[data-tone='poor'] {
			--c-meter: var(--c-error);
		}

		.dot {
			width: 0.9rem;
			height: 0.9rem;
			border-radius: 50%;
			border: 1px solid color-mix(in srgb, var(--c-text), transparent 80%);
			background: linear-gradient(90deg, var(--c-meter) calc(var(--frac) * 100%), transparent calc(var(--frac) * 100%));
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

	/* Cap the CORE3 metric tooltips and give the score breakdown a real bullet list */
	:global(.core3-ratings .tooltip .popup) {
		max-width: 400px;
	}

	:global(.core3-ratings .tooltip .popup ul) {
		margin: 0 0 0.5em;
		padding-left: 1.25em;
		list-style: disc;
	}

	:global(.core3-ratings .tooltip .popup li) {
		margin-bottom: 0.2em;
	}

	:global(.core3-ratings .tooltip .popup p:last-child) {
		margin-bottom: 0;
	}
</style>
