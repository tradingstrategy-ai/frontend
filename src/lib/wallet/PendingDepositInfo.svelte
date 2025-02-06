<script lang="ts">
	import type { SmartContracts } from 'trade-executor/schemas/summary';
	import type { VaultWithInternalDeposits } from 'trade-executor/vaults/base';
	import type { SettlementRequired } from 'trade-executor/vaults/types';
	import { config } from './client';
	import { slide } from 'svelte/transition';
	import Button from '$lib/components/Button.svelte';
	import IconHistory from '~icons/local/history';
	import IconSuccess from '~icons/local/success';
	import { formatBalance } from '$lib/eth-defi/helpers';

	type Props = {
		vault: VaultWithInternalDeposits<SmartContracts> & SettlementRequired;
		address: Address;
	};

	let { vault, address }: Props = $props();
</script>

{#await vault.getPendingDeposit(config, address) then { asset, shares, settled }}
	<div class={['pending-deposit', settled && 'settled']} transition:slide>
		<h3>
			{#if settled}
				<IconSuccess />
				Deposit Settled
			{:else}
				<IconHistory />
				Pending Deposit
			{/if}
		</h3>
		<dl class="values">
			<div class="asset">
				<dt>${formatBalance(asset, 2, 4)}</dt>
				<dd>{asset.label}</dd>
			</div>
			<div class="shares">
				<dt>{formatBalance(shares, 2, 4)}</dt>
				<dd>{settled ? 'shares claimable' : 'estimated shares'}</dd>
			</div>
		</dl>
		{#if settled}
			<Button size="sm" label="Claim shares" />
		{:else}
			<Button secondary size="sm" label="Cancel request" />
		{/if}
	</div>
{/await}

<style>
	.pending-deposit {
		background: var(--c-box-2);
		border-radius: var(--radius-sl);
		padding: 1.125rem;
		display: grid;
		gap: 0.875rem;

		h3 {
			font: var(--f-heading-xs-medium);
			font-size: 0.875rem;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			color: var(--c-text-extra-light);
			white-space: nowrap;
			display: flex;
			gap: 1ex;
			align-items: center;
			--icon-size: 1.25rem;

			.settled & {
				color: var(--c-success);
			}

			:global(.icon.history) {
				transform: scaleX(-1);
			}

			:global(.icon *) {
				stroke-width: 2.5;
			}
		}

		.values {
			:is(dt, dd) {
				display: inline;
			}

			dd {
				color: var(--c-text-extra-light);
			}

			.asset {
				dt {
					font: var(--f-ui-xl-medium);
					letter-spacing: var(--ls-ui-xl);
				}

				dd {
					font: var(--f-ui-md-medium);
					letter-spacing: var(--ls-ui-md);
				}
			}

			.shares {
				dt {
					font: var(--f-ui-md-medium);
					letter-spacing: var(--ls-ui-md);
				}

				dd {
					font: var(--f-ui-sm-medium);
					letter-spacing: var(--ls-ui-sm);
				}
			}
		}
	}
</style>
