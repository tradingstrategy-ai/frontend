<!--
@component
Displays the third-party Xerberus risk assessment for a vault or protocol.

Xerberus may rate a vault pool directly or fall back to an assessment of its
underlying protocol. This distinction is stated in the card so users do not
mistake protocol coverage for a vault-specific assessment.

@example

```svelte
  <XerberusRisk xerberus={vault.xerberus} />
```
-->
<script lang="ts">
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { formatNumber } from '$lib/helpers/formatters';
	import { riskRatingProviders } from './risk-rating-providers';
	import type { XerberusVault } from './schemas';
	import type { XerberusProtocolScore } from '$lib/xerberus/protocol-scores';
	import IconQuestionCircle from '~icons/local/question-circle';

	interface Props {
		xerberus: XerberusVault | XerberusProtocolScore;
		context?: 'protocol' | 'vault';
	}

	let { xerberus, context = 'vault' }: Props = $props();
	let score = $derived('entity_type' in xerberus ? xerberus.score : xerberus.score * 100);
	let reportUrl = $derived('entity_type' in xerberus ? xerberus.report_url : xerberus.url);
	let isPoolAssessment = $derived('entity_type' in xerberus && xerberus.entity_type === 'pool');
	let assessmentLabel = $derived(isPoolAssessment ? 'Pool-level' : 'Protocol-level');
	let assessmentDescription = $derived(
		isPoolAssessment
			? 'This is a Xerberus risk rating for this vault.'
			: 'This is a Xerberus risk rating for this vault’s underlying protocol.'
	);
</script>

<MetricsBox class="xerberus-risk">
	<div class="content">
		<header class="box-header">
			<img class="xerberus-icon" src={riskRatingProviders.xerberus.logoUrl} alt={riskRatingProviders.xerberus.name} />
			{#if context !== 'protocol'}
				<div class="score">{formatNumber(score, 0, 0)}</div>
			{/if}
			<h2>Xerberus risk rating</h2>
		</header>

		<table class="data" class:protocol={context === 'protocol'}>
			<tbody>
				<tr>
					<th>
						<Tooltip>
							<span slot="trigger" class="metric-label">
								Xerberus score
								<IconQuestionCircle />
							</span>
							<svelte:fragment slot="popup">
								The Xerberus assessment uses a 0–100 scale. Higher scores represent a stronger rating.
							</svelte:fragment>
						</Tooltip>
					</th>
					<td>{formatNumber(score, 0, 0)} / 100</td>
				</tr>
				{#if context !== 'protocol'}
					<tr>
						<th>Assessment level</th>
						<td>{assessmentLabel}</td>
					</tr>
					<tr>
						<th>Rated entity</th>
						<td>{xerberus.name}</td>
					</tr>
				{/if}
			</tbody>
		</table>

		<footer class="footer">
			{#if context !== 'protocol'}
				<p>{assessmentDescription}</p>
			{/if}
			{#if reportUrl}
				<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
				<a href={reportUrl} target="_blank" rel="noreferrer" class:protocol-link={context === 'protocol'}>
					{#if context === 'protocol'}
						<span>View this protocol on Xerberus</span> to understand the protocol risk score.
					{:else}
						View this {isPoolAssessment ? 'vault' : 'protocol'} rating on Xerberus
					{/if}
				</a>
			{/if}
		</footer>
	</div>
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
	}

	.xerberus-icon {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: var(--radius-sm);
		object-fit: contain;
	}

	.score {
		display: grid;
		place-items: center;
		min-width: 3.25rem;
		padding: 0.25rem 0.75rem;
		border: 2px solid color-mix(in srgb, var(--c-link), transparent 55%);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--c-link), transparent 88%);
		font: var(--f-heading-md-medium);
		color: color-mix(in srgb, var(--c-text), var(--c-link) 80%);
	}

	.footer {
		border-top: 1px solid var(--c-box-3);
		padding-top: 1.25rem;
		display: grid;
		gap: 0.5rem;

		p {
			margin: 0;
		}

		a {
			justify-self: start;
		}
	}

	.footer p,
	.footer a {
		font: var(--f-ui-md-roman);
		color: var(--c-text-extra-light);
	}

	.footer a {
		text-decoration: underline;
		font-weight: 500;
		color: var(--c-text-light);

		&.protocol-link {
			text-decoration: none;

			span {
				text-decoration: underline;
			}
		}
	}

	table.data {
		width: 100%;
		border-collapse: collapse;

		&.protocol {
			width: auto;
			justify-self: start;

			th,
			td {
				text-align: left;
			}

			th {
				padding-right: 1rem;
			}
		}

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
	}

	.metric-label {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;

		:global(.icon) {
			color: var(--c-text-extra-light);
		}
	}

	:global(.xerberus-risk .tooltip .popup) {
		max-width: 360px;
	}
</style>
