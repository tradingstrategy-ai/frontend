<script lang="ts">
	import { formatPercent } from '$lib/helpers/formatters.js';

	let { data } = $props();
	let { vault } = $derived(data);
</script>

<header>
	<h3>{vault.name}</h3>
	<p>{vault.protocol}</p>
</header>

<div class="returns tile b">
	<h4>Vault Returns</h4>

	<table>
		<thead>
			<tr>
				<th></th>
				<th>1 month</th>
				<th>3 month</th>
				<th>1 year</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td>Gross</td>
				<td>
					<span>{formatPercent(vault.one_month_cagr)}</span>
					<span>{formatPercent(vault.one_month_returns)}</span>
				</td>
				<td>
					<span>{formatPercent(vault.three_months_cagr)}</span>
					<span>{formatPercent(vault.three_months_returns)}</span>
				</td>
				<td>
					<span>{formatPercent(vault.cagr)}</span>
					<span>{formatPercent(vault.lifetime_return)}</span>
				</td>
			</tr>
			<tr>
				<td>Net</td>
				<td>
					<span>{formatPercent(vault.one_month_cagr_net)}</span>
					<span>{formatPercent(vault.one_month_returns_net)}</span>
				</td>
				<td>
					<span>{formatPercent(vault.three_months_cagr_net)}</span>
					<span>{formatPercent(vault.three_months_returns_net)}</span>
				</td>
				<td>
					<span>{formatPercent(vault.cagr_net)}</span>
					<span>{formatPercent(vault.lifetime_return_net)}</span>
				</td>
			</tr>
		</tbody>
	</table>
</div>

<style>
	header {
		margin-bottom: 3rem;

		h3 {
			margin-bottom: 0.25rem;
			font: var(--f-heading-lg-bold);
			letter-spacing: var(--ls-heading-lg, normal);
		}

		p {
			font: var(--f-heading-xs-bold);
			letter-spacing: var(--ls-heading-xs, normal);
			color: var(--c-text-extra-light);
		}
	}

	h4 {
		margin-bottom: 0.5em;
		font: var(--f-heading-xs-medium);
		letter-spacing: 0.05em;
		color: var(--c-text-extra-light);
		text-transform: uppercase;
	}

	.returns {
		padding: 1.75rem;

		table {
			width: 100%;
			border-collapse: collapse;
			font: var(--f-ui-md-roman);
		}

		th {
			border-bottom: 2px solid var(--c-text-extra-light);
		}

		td {
			border-bottom: 1px solid var(--c-text-extra-light);
		}

		:is(th, td) {
			padding: 0.5rem;

			&:first-child {
				font-weight: 500;
			}

			&:not(:first-child) {
				text-align: right;
			}
		}

		td span {
			display: grid;
			grid-template-columns: 1fr 3ch;
			gap: 0.25rem;

			&:first-child::after {
				content: 'ann';
			}

			&:last-child {
				padding-top: 0.25em;
				color: var(--c-text-extra-light);
				&::after {
					content: 'abs';
				}
			}
		}
	}
</style>
