<script lang="ts">
	import { SummaryBox, Tooltip } from '$lib/components';
	import IconQuestionCircle from '~icons/local/question-circle';
	import { formatPercent } from '$lib/helpers/formatters';

	export let data;
	const { strategy } = data;

	const { fees } = strategy;
	const totalPerformanceFee = fees.trading_strategy_protocol_fee + fees.strategy_developer_fee;

	const hasEnzymeVault = strategy.on_chain_data.asset_management_mode === 'enzyme';
	const enzymeFeeUrl = 'https://docs.enzyme.finance/what-is-enzyme/faq#fees-performance-and-accounting';
</script>

<svelte:head>
	<title>Fees | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Trading fee information for {strategy.name} strategy" />
</svelte:head>

<section class="fees">
	<h2>Fees</h2>
	<ul>
		<li>
			<span>Management fee</span>
			<span class="value">{formatPercent(fees.management_fee, 2)}</span>
		</li>

		<li>
			<span>Total performance fee</span>
			<span class="value">{formatPercent(totalPerformanceFee, 2)}</span>

			<ul>
				<li class:no-share={fees.trading_strategy_protocol_fee === 0}>
					<Tooltip>
						<span slot="trigger">
							Trading Strategy Protocol fee
							<IconQuestionCircle />
						</span>
						<div slot="popup">Share of strategy's profits distributed back to Trading Strategy protocol.</div>
					</Tooltip>
					<span class="value">{formatPercent(fees.trading_strategy_protocol_fee, 2)}</span>
				</li>
				<li class:no-share={fees.strategy_developer_fee === 0}>
					<Tooltip>
						<span slot="trigger">
							Strategy developer fee
							<IconQuestionCircle />
						</span>
						<div slot="popup">Share of strategy's profits distributed to the strategy developer.</div>
					</Tooltip>
					<span class="value">{formatPercent(fees.strategy_developer_fee, 2)}</span>
				</li>
				<li>
					<Tooltip>
						<span slot="trigger">
							Strategy participant share
							<IconQuestionCircle />
						</span>
						<div slot="popup">Share of strategy's profits returned to participants with deposits in the strategy.</div>
					</Tooltip>
					<span class="value">{formatPercent(1 - totalPerformanceFee, 2)}</span>
				</li>
			</ul>
		</li>

		{#if hasEnzymeVault}
			<li>
				<Tooltip>
					<span slot="trigger">
						Enzyme Protocol fee
						<IconQuestionCircle />
					</span>
					<div slot="popup">
						<p>
							The Enzyme protocol fee rate applied to the vault is 0.50%. Shares accrued can be bought back with MLN at
							a 50% discount, leading to an effective protocol fee rate of 0.25%.
						</p>
						<p>
							<a href={enzymeFeeUrl} target="_blank" rel="noreferrer">Read more</a>
							about Enzyme protocol fees.
						</p>
					</div>
				</Tooltip>
				<span class="value">{formatPercent(fees.enzyme_protocol_fee, 2)}</span>
			</li>
		{/if}
	</ul>

	<SummaryBox title="Beta info">
		<p class="beta-info">
			{#if fees.trading_strategy_protocol_fee > 0}
				For early users, Trading Strategy is offering a discounted protocol fee of just
				{formatPercent(fees.trading_strategy_protocol_fee)}.
			{:else}
				During the beta Trading Strategy does not charge any fees.
			{/if}
		</p>
	</SummaryBox>
</section>

<style lang="postcss">
	.fees {
		display: grid;
		grid-template-columns: 8fr minmax(18rem, 5fr);
		gap: 1.25rem;
		align-items: flex-start;
		align-content: flex-start;

		@media (--viewport-sm-down) {
			grid-template-columns: 1fr;
		}

		h2 {
			grid-column: 1 / -1;
			font: var(--f-heading-lg-medium);
		}

		ul {
			display: grid;
			gap: 0.75rem;
			list-style-type: none;
			padding: 0;

			li {
				display: grid;
				grid-template-columns: auto auto;
				justify-content: space-between;
				gap: inherit;
				border-radius: var(--radius-md);
				padding: 1rem;
				background: var(--c-box-1);
				font: var(--f-ui-md-medium);
				letter-spacing: var(--ls-ui-md);

				.no-share {
					color: var(--c-text-extra-light);
				}

				.value {
					text-align: right;
				}

				ul {
					grid-column: 1 / -1;
					margin-top: 0.25rem;
					gap: 0;

					li {
						border-radius: 0;
						padding: 0.5rem 0;
						background: transparent;
						font: var(--f-ui-sm-medium);
						letter-spacing: var(--ls-ui-sm);
						color: var(--c-text-light);
						--border-color: color-mix(in srgb, var(--c-text-ultra-light), transparent);
						border-bottom: 1px solid var(--border-color);

						&:first-child {
							border-top: 1px solid var(--border-color);
						}
					}
				}
			}
		}

		p.beta-info {
			@media (--viewport-md-down) {
				font: var(--f-ui-md-roman);
				letter-spacing: var(--ls-ui-md);
			}
		}

		[slot='trigger'] {
			display: flex;
			gap: 0.75ex;
			align-items: center;
		}

		[slot='popup'] p {
			max-width: 50ch;
			font: var(--f-ui-md-roman);
			letter-spacing: var(--ls-ui-md-roman);
		}
	}
</style>
