<!--
Fees page for YAML-configured strategies — displays vault fee information.
-->
<script lang="ts">
	import { Tooltip } from '$lib/components';
	import IconQuestionCircle from '~icons/local/question-circle';
	import { formatPercent } from '$lib/helpers/formatters';
	import { getFeeModeLabel, getFeeModeDescription } from '$lib/top-vaults/helpers';

	export let data;

	$: ({ strategy, vaultInfo } = data);
</script>

<svelte:head>
	<title>Fees | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Fee information for {strategy.name} strategy" />
</svelte:head>

{#if vaultInfo}
	<section class="fees">
		<h2>Fees</h2>

		<div class="fees-list">
			<div class="row">
				<Tooltip>
					<span slot="trigger">Management fee <IconQuestionCircle /></span>
					<div slot="popup">
						<p>The management fee is a periodic fee charged for managing the vault's assets.</p>
						<p><a href="/glossary/management-fee" target="_blank">Learn more about management fees</a>.</p>
					</div>
				</Tooltip>
				<span>{vaultInfo.mgmt_fee != null ? formatPercent(vaultInfo.mgmt_fee, 2) : '—'}</span>
			</div>

			<div class="row">
				<Tooltip>
					<span slot="trigger">Performance fee <IconQuestionCircle /></span>
					<div slot="popup">
						<p>The performance fee is charged against the vault's profits.</p>
						<p><a href="/glossary/performance-fee" target="_blank">Learn more about performance fees</a>.</p>
					</div>
				</Tooltip>
				<span>{vaultInfo.perf_fee != null ? formatPercent(vaultInfo.perf_fee, 2) : '—'}</span>
			</div>

			{#if vaultInfo.deposit_fee != null}
				<div class="row">
					<Tooltip>
						<span slot="trigger">Deposit fee <IconQuestionCircle /></span>
						<div slot="popup">Fee charged when depositing into the vault.</div>
					</Tooltip>
					<span>{formatPercent(vaultInfo.deposit_fee, 2)}</span>
				</div>
			{/if}

			{#if vaultInfo.withdraw_fee != null}
				<div class="row">
					<Tooltip>
						<span slot="trigger">Withdrawal fee <IconQuestionCircle /></span>
						<div slot="popup">Fee charged when withdrawing from the vault.</div>
					</Tooltip>
					<span>{formatPercent(vaultInfo.withdraw_fee, 2)}</span>
				</div>
			{/if}

			{#if vaultInfo.fee_mode}
				<div class="row">
					<Tooltip>
						<span slot="trigger">Fee mode <IconQuestionCircle /></span>
						<div slot="popup">{getFeeModeDescription(vaultInfo.fee_mode)}</div>
					</Tooltip>
					<span>{getFeeModeLabel(vaultInfo.fee_mode)}</span>
				</div>
			{/if}
		</div>
	</section>
{:else}
	<p class="no-vault">Fee data is currently unavailable.</p>
{/if}

<style>
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

			p {
				margin: 0;
				& + p {
					margin-top: 0.75em;
				}
			}
		}
	}

	.no-vault {
		color: var(--c-text-extra-light);
		font: var(--f-ui-lg-roman);
	}
</style>
