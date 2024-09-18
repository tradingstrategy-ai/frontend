<script lang="ts">
	import { Tooltip } from '$lib/components';
	import IconQuestionCircle from '~icons/local/question-circle';
	import { formatPercent } from '$lib/helpers/formatters';

	export let data;
	const { strategy } = data;

	const { fees } = strategy;
	const totalPerformanceFee = fees.trading_strategy_protocol_fee + fees.strategy_developer_fee;

	const hasEnzymeVault = strategy.on_chain_data.asset_management_mode === 'enzyme';
	const enzymeFeeUrl = 'https://docs.enzyme.finance/what-is-enzyme/faq#fees-performance-and-accounting';
	const enzymeProtocolFee = 0.0025;
</script>

<svelte:head>
	<title>Fees | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Trading fee information for {strategy.name} strategy" />
</svelte:head>

<section class="fees">
	<h2>Fees</h2>

	<div class="fees-list">
		<div class="row">
			<Tooltip>
				<span slot="trigger">Management fee <IconQuestionCircle /></span>
				<div slot="popup">
					<p>The management fee is a periodic fee charged for managing the strategy's assets.</p>
					<p><a href="/glossary/management-fee" target="_blank">Learn more about management fees</a>.</p>
				</div>
			</Tooltip>
			<span>{formatPercent(fees.management_fee, 2)}</span>
		</div>

		<div class="fees-group">
			<header class="row">
				<Tooltip>
					<span slot="trigger">Total performance fee <IconQuestionCircle /></span>
					<div slot="popup">
						<p>The combined fee charged against the strategy's profits.</p>
						<p><a href="/glossary/performance-fee" target="_blank">Learn more about performance fees</a>.</p>
					</div>
				</Tooltip>
				<span>{formatPercent(totalPerformanceFee, 2)}</span>
			</header>

			<div class="fees-list">
				<div class="row">
					<Tooltip>
						<span slot="trigger">Trading Strategy protocol fee <IconQuestionCircle /></span>
						<div slot="popup">
							Percent of strategy's profits distributed to the Trading Strategy protocol.
							{#if fees.trading_strategy_protocol_fee === 0}
								During the beta period, Trading Strategy is not charging a protocol fee.
							{:else if fees.trading_strategy_protocol_fee <= 0.02}
								For early users, Trading Strategy is offering a discounted protocol fee of
								<strong>{formatPercent(fees.trading_strategy_protocol_fee)}</strong>.
							{/if}
						</div>
					</Tooltip>
					<span>{formatPercent(fees.trading_strategy_protocol_fee, 2)}</span>
				</div>
				<div class="row">
					<Tooltip>
						<span slot="trigger">Strategy developer fee <IconQuestionCircle /></span>
						<div slot="popup">Percent of strategy's profits earned by the strategy developer.</div>
					</Tooltip>
					<span>{formatPercent(fees.strategy_developer_fee, 2)}</span>
				</div>
			</div>

			<footer class="row">
				<Tooltip>
					<span slot="trigger">Strategy participant share <IconQuestionCircle /></span>
					<div slot="popup">
						Percentage of strategy profits allocated to depositors, after deducting performance fees.
					</div>
				</Tooltip>
				<span>{formatPercent(1 - totalPerformanceFee, 2)}</span>
			</footer>
		</div>

		{#if hasEnzymeVault}
			<div class="row">
				<Tooltip>
					<span slot="trigger">Enzyme Protocol fee <IconQuestionCircle /></span>
					<div slot="popup">
						<p>
							The Enzyme protocol fee rate applied to the vault is 0.50%. Shares accrued can be bought back with MLN at
							a 50% discount, leading to an effective protocol fee rate of 0.25%.
						</p>
						<p>
							<a href={enzymeFeeUrl} target="_blank" rel="noreferrer">Learn more about Enzyme protocol fees</a>.
						</p>
					</div>
				</Tooltip>
				<span>{formatPercent(enzymeProtocolFee, 2)}</span>
			</div>
		{/if}
	</div>
</section>

<style lang="postcss">
	.fees {
		display: grid;
		gap: 1.5rem;
		align-content: flex-start;

		h2 {
			font: var(--f-heading-lg-medium);
		}

		.fees-list {
			display: grid;
			gap: 1rem;

			@media (--viewport-lg-up) {
				max-width: 50rem;
			}

			.row {
				display: grid;
				grid-template-columns: auto auto;
				justify-content: space-between;
				gap: 1rem;
				border-radius: var(--radius-md);
				padding: 1rem;
				background: var(--c-box-2);
				font: var(--f-ui-md-medium);
				letter-spacing: var(--ls-ui-md);

				@media (--viewport-xs) {
					font: var(--f-ui-sm-medium);
					letter-spacing: var(--ls-ui-sm);
				}
			}

			.fees-group {
				border-radius: var(--radius-md);
				background: var(--c-box-1);

				.fees-list {
					margin: 1.25rem 1rem;
					gap: 0.625rem;

					.row {
						padding: 0;
						text-indent: 1em;
						background: transparent;
						font: var(--f-ui-sm-medium);
						letter-spacing: var(--ls-ui-sm);
						color: var(--c-text-light);

						@media (--viewport-xs) {
							font: var(--f-ui-xs-medium);
							letter-spacing: var(--ls-ui-xs);
						}
					}
				}

				:is(header, footer) {
					background: var(--c-box-1);
					padding: 1rem;
				}

				header {
					border-radius: var(--radius-md) var(--radius-md) 0 0;
				}

				footer {
					border-radius: 0 0 var(--radius-md) var(--radius-md);
				}
			}
		}

		[slot='trigger'] {
			display: flex;
			gap: 0.75ex;
			align-items: center;
		}

		[slot='popup'] {
			max-width: 50ch;
			font: var(--f-ui-md-roman);
			letter-spacing: var(--ls-ui-md-roman);
		}
	}
</style>
