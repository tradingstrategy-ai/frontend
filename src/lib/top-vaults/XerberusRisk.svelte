<!--
@component
Displays the third-party Xerberus risk assessment for a vault or protocol.

The compact header mirrors the CORE3 rating card. Its disclosure sends users
to Xerberus for the full assessment rather than duplicating the report here.

@example

```svelte
  <XerberusRisk xerberus={vault.xerberus} />
```
-->
<script lang="ts">
	import MetricsBox from '$lib/components/MetricsBox.svelte';
	import { formatNumber } from '$lib/helpers/formatters';
	import { riskRatingProviders } from './risk-rating-providers';
	import type { XerberusVault } from './schemas';
	import IconChevronDown from '~icons/local/chevron-down';

	interface Props {
		xerberus: XerberusVault;
	}

	let { xerberus }: Props = $props();
	let score = $derived(xerberus.score);
	let reportUrl = $derived(xerberus.report_url);
	let assessmentType = $derived(xerberus.entity_type === 'pool' ? 'vault' : 'protocol');
</script>

<MetricsBox class="xerberus-risk">
	<details class="rating-details">
		<summary class="box-header">
			<img
				class="provider-icon"
				src={riskRatingProviders.xerberus.logoUrl}
				alt={riskRatingProviders.xerberus.logoAlt}
			/>
			<h2>Xerberus risk rating</h2>
			<div class="score" role="img" aria-label="Xerberus score {formatNumber(score, 0, 0)} out of 100">
				{formatNumber(score, 0, 0)}
			</div>
			<span class="toggle">
				<span class="view-more">View more</span>
				<span class="view-less">View less</span>
				<IconChevronDown />
			</span>
		</summary>

		<div class="rating-details-content">
			{#if reportUrl}
				<p>
					<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
					<a href={reportUrl} target="_blank" rel="noreferrer"
						>Visit Xerberus to view the full {assessmentType} risk rating.</a
					>
				</p>
			{:else}
				<p>
					<a href={riskRatingProviders.xerberus.website} target="_blank" rel="noreferrer"
						>Visit Xerberus to view the full {assessmentType} risk rating.</a
					>
				</p>
			{/if}
		</div>
	</details>
</MetricsBox>

<style>
	.box-header {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		cursor: pointer;
		list-style: none;

		&::-webkit-details-marker {
			display: none;
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
	}

	.provider-icon {
		width: 2.5rem;
		height: 2.5rem;
		border-radius: var(--radius-sm);
		object-fit: contain;
	}

	.score {
		display: grid;
		flex: 0 0 auto;
		place-items: center;
		min-width: 3.25rem;
		padding: 0.25rem 0.75rem;
		border: 2px solid color-mix(in srgb, var(--c-link), transparent 55%);
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--c-link), transparent 88%);
		font: var(--f-heading-md-medium);
		color: color-mix(in srgb, var(--c-text), var(--c-link) 80%);
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

	.rating-details {
		&[open] .toggle :global(.icon) {
			rotate: 180deg;
		}
	}

	.view-less {
		display: none;
	}

	.rating-details[open] {
		.view-more {
			display: none;
		}

		.view-less {
			display: inline;
		}
	}

	.rating-details-content {
		margin-top: 1.25rem;
		border-top: 1px solid var(--c-box-3);
		padding-top: 1.25rem;

		p {
			margin: 0;
			font: var(--f-ui-md-roman);
			color: var(--c-text-extra-light);

			a {
				color: var(--c-text-light);
				font-weight: 500;
				text-decoration: underline;
			}
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
</style>
