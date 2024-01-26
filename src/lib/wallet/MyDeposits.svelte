<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import type { ApiChain } from '$lib/helpers/chain';
	import type { ConnectedStrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import fsm from 'svelte-fsm';
	import { goto } from '$app/navigation';
	import { switchChain } from '@wagmi/core';
	import { wizard } from 'wizard/store';
	import { config, disconnect, wallet, DepositWarning, DepositBalance, VaultBalance } from '$lib/wallet';
	import { Button, HashAddress, Icon } from '$lib/components';
	import { formatBalance } from '$lib/eth-defi/helpers';
	import { formatDollar } from '$lib/helpers/formatters';

	export let strategy: ConnectedStrategyRuntimeState;
	export let chain: ApiChain;

	let contentWrapper: HTMLElement;
	let contentHeight = 'auto';

	let vaultBalance: MaybeString;

	$: contracts = strategy.on_chain_data.smart_contracts;
	$: depositEnabled = [
		contracts.vault,
		contracts.comptroller,
		contracts.payment_forwarder,
		contracts.fund_value_calculator
	].every(Boolean);

	$: connected = $wallet.isConnected;
	$: wrongNetwork = connected && $wallet.chain?.id !== chain.chain_id;
	$: buttonsDisabled = !depositEnabled || wrongNetwork;

	const expandable = fsm('closed', {
		closed: {
			toggle: 'open'
		},
		open: {
			toggle: 'closed',
			close: 'closed',
			_enter() {
				const clientHeight = contentWrapper.firstElementChild?.clientHeight;
				contentHeight = clientHeight ? `${clientHeight}px` : 'auto';
			}
		}
	});

	function disconnectWallet() {
		disconnect();
		expandable.close();
	}

	function setVaultBalance({ detail }: ComponentEvents<VaultBalance>['dataFetch']) {
		if (detail.vaultNetValue) {
			vaultBalance = formatBalance(detail.vaultNetValue);
		}
	}

	function launchWizard(slug: string) {
		wizard.init(slug, `/strategies/${strategy.id}`, {
			chainId: chain.chain_id,
			strategyName: strategy.name,
			contracts
		});
		goto(`/wizard/${slug}/introduction`);
	}
</script>

<div class="my-deposits {$expandable} {$wallet.status}" style:--content-height={contentHeight}>
	<header>
		<h2 class="desktop">My deposits</h2>
		{#if connected}
			<button class="mobile" on:click={expandable.toggle}>
				<div class="inner">
					<h2>My deposits</h2>
					<div class="wallet-address">
						{#if $wallet.address}
							<Icon name="wallet" size="1.25rem" />
							<HashAddress address={$wallet.address ?? ''} endChars={5} />
						{/if}
					</div>
					<div class="vault-balance" class:skeleton={vaultBalance === undefined}>
						{formatDollar(vaultBalance)}
					</div>
				</div>
				<Icon name="chevron-down" size="1.25rem" />
			</button>
		{:else}
			<button class="mobile" on:click={() => launchWizard('connect-wallet')}>
				Connect wallet
				<Icon name="wallet" size="1.25rem" />
			</button>
		{/if}
	</header>
	<div class="content-wrapper" bind:this={contentWrapper}>
		<div class="content">
			{#if !depositEnabled}
				<DepositWarning title="Deposits not enabled">
					This strategy is not using smart contract-based capital management and is not accepting external investments.
				</DepositWarning>
			{:else if !connected}
				<DepositWarning title="Wallet not connected">Please connect wallet to see your deposit status.</DepositWarning>
			{:else if wrongNetwork}
				<DepositWarning title="Wrong network">
					Please connect to {chain.chain_name}.
				</DepositWarning>
			{:else}
				<dl class="balances">
					<VaultBalance {contracts} address={$wallet.address} let:shares let:value on:dataFetch={setVaultBalance}>
						<DepositBalance label="Value" data={value} dollar />
						<DepositBalance label="Shares" data={shares} />
					</VaultBalance>
				</dl>
			{/if}
			<div class="actions">
				{#if depositEnabled && !connected}
					<Button class="full-width" on:click={() => launchWizard('connect-wallet')}>
						<Icon slot="icon" name="wallet" --icon-size="1.25em" />
						Connect wallet
					</Button>
				{:else if depositEnabled && wrongNetwork}
					<Button
						class="full-width"
						label="Switch network"
						on:click={() => switchChain(config, { chainId: chain.chain_id })}
					/>
				{/if}
				{#if connected}
					<Button class="mobile full-width" label="Disconnect wallet" on:click={disconnectWallet}>
						<Icon slot="icon" name="unlink" --icon-size="1.25em" />
					</Button>
				{/if}
				<Button label="Deposit" disabled={buttonsDisabled} on:click={() => launchWizard('deposit')} />
				<Button secondary label="Redeem" disabled={buttonsDisabled} on:click={() => launchWizard('redeem')} />
			</div>
		</div>
	</div>
</div>

<style lang="postcss">
	.my-deposits {
		@media (--viewport-sm-down) {
			:global(.desktop) {
				display: none !important;
			}
		}
		@media (--viewport-md-up) {
			:global(.mobile) {
				display: none !important;
			}
		}

		display: grid;
		grid-template-rows: auto 1fr;
		border: 1px solid hsl(var(--hsl-text-light));
		border-radius: var(--radius-md);
		--padding: 1.25rem;
		--gap: 1rem;
	}

	header {
		--header-padding: var(--padding) var(--padding) calc(var(--gap) / 2);

		button {
			display: grid;
			gap: 0.75em;
			align-items: center;
			width: 100%;
			padding: var(--header-padding);
			border: none;
			background: transparent;
			text-align: left;
			cursor: pointer;
			transition: padding var(--time-md) ease-out;

			.closed & {
				--header-padding: 0.75rem var(--padding);
			}

			.connected & {
				grid-template-columns: 1fr 1.25rem;
			}

			.inner {
				display: grid;
				grid-template-columns: repeat(3, calc((100% - var(--gap)) / 2));
				gap: var(--gap);
				overflow: hidden;

				& > * {
					transition: transform var(--time-md) ease-out;

					.closed & {
						transform: translate(calc(-1 * (100% + var(--gap))), 0);
					}
				}
			}

			.disconnected & {
				grid-template-columns: auto auto;
				justify-content: center;
				font: var(--f-ui-md-medium);
				letter-spacing: var(--ls-ui-md);
			}

			.vault-balance {
				font: var(--f-ui-md-bold);
				letter-spacing: var(--ls-ui-md, normal);
				text-align: right;
				--skeleton-width: 5ch;
				--skeleton-height: 90%;

				&.skeleton::before {
					right: 0;
				}
			}

			:global(.chevron-down svg) {
				transition: transform var(--time-md) ease-out;

				.open & {
					transform: rotate(180deg);
				}
			}
		}
	}

	h2 {
		font: var(--f-heading-xs-medium);
		font-size: 1rem;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: hsl(var(--hsl-text-ultra-light));
		white-space: nowrap;

		.mobile & {
			/* custom xxs heading size (no CSS var) */
			font-size: 0.875rem;
		}

		&.desktop {
			padding: var(--header-padding);
		}
	}

	.wallet-address {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.75ex;
		align-items: center;
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--ls-ui-sm, normal);

		.open & {
			margin-left: 0.625rem;
		}
	}

	.content-wrapper {
		@media (--viewport-sm-down) {
			overflow: hidden;
			height: 0;
			transition: height var(--time-md) ease-out;

			.open & {
				height: var(--content-height);
			}
		}

		.content {
			display: grid;
			grid-template-rows: 1fr auto;
			gap: var(--gap);
			padding: calc(var(--gap) / 2) var(--padding) var(--padding);
		}
	}

	.balances {
		display: grid;
		grid-template-columns: 1fr 1fr;
		align-self: center;
	}

	.actions {
		display: grid;
		gap: inherit;
		grid-template-columns: 1fr 1fr;

		/* desktop: normally buttons span both cols */
		:global(.button) {
			grid-column: 1 / -1;
		}

		/* desktop: if 2-col button is present, siblings should span single col */
		:global(.full-width:not(.mobile) ~ .button) {
			grid-column: auto;
		}

		/* mobile: non 2-col buttons always span single col on mobile */
		@media (--viewport-sm-down) {
			:global(:not(.full-width)) {
				grid-column: auto;
			}
		}
	}
</style>
