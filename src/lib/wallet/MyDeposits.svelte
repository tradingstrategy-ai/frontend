<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import type { Chain } from '$lib/helpers/chain';
	import type { ConnectedStrategyInfo } from 'trade-executor/models/strategy-info';
	import type { BaseAssetManager } from 'trade-executor/vaults/base';
	import fsm from 'svelte-fsm';
	import { goto } from '$app/navigation';
	import { disconnect, switchChain, wallet, config } from '$lib/wallet/client';
	import { Button, HashAddress } from '$lib/components';
	import DepositWarning from '$lib/wallet/DepositWarning.svelte';
	import DepositBalance from '$lib/wallet/DepositBalance.svelte';
	import VaultBalance from '$lib/wallet/VaultBalance.svelte';
	import IconWallet from '~icons/local/wallet';
	import IconChevronDown from '~icons/local/chevron-down';
	import IconUnlink from '~icons/local/unlink';
	import { formatBalance } from '$lib/eth-defi/helpers';
	import { formatDollar } from '$lib/helpers/formatters';
	import { type CountryCode, getCountryName } from '$lib/helpers/geo';

	interface Props {
		strategy: ConnectedStrategyInfo;
		chain: Chain;
		vault: BaseAssetManager;
		geoBlocked: boolean;
		ipCountry: CountryCode | undefined;
	}

	let { strategy, chain, vault, geoBlocked, ipCountry }: Props = $props();

	let contentWrapper = $state() as HTMLElement;
	let contentHeight = $state('auto');

	let vaultBalance: MaybeString = $state();

	const isOutdated = Boolean(strategy.newVersionId);

	let connected = $derived($wallet.status === 'connected');
	let wrongNetwork = $derived(connected && $wallet.chain?.id !== chain.id);
	let buttonsDisabled = $derived(!vault.depositEnabled() || geoBlocked || wrongNetwork);

	if ($wallet.address && vault.internalDepositEnabled() && vault.requiresSettlement()) {
		vault.getPendingDeposit(config, $wallet.address).then(console.log);
	}

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

	function getWizardUrl(slug: string) {
		return `/strategies/${strategy.id}/${slug}/introduction`;
	}
</script>

<div class="my-deposits {$expandable}" style:--content-expanded-height={contentHeight}>
	<header>
		<h2 class="desktop">My deposits</h2>
		{#if connected}
			<button class="mobile" onclick={expandable.toggle}>
				<div class="inner">
					<h2>My deposits</h2>
					<div class="wallet-address">
						{#if $wallet.address}
							<IconWallet --icon-size="1.25rem" />
							<HashAddress address={$wallet.address ?? ''} endChars={5} />
						{/if}
					</div>
					{#if !buttonsDisabled}
						<div class="vault-balance" class:skeleton={vaultBalance === undefined}>
							{formatDollar(vaultBalance)}
						</div>
					{/if}
				</div>
				<IconChevronDown --icon-size="1.25em" />
			</button>
		{:else}
			<button class="mobile" onclick={() => goto(getWizardUrl('connect-wallet'))}>
				Connect wallet
				<IconWallet --icon-size="1.25em" />
			</button>
		{/if}
	</header>
	<div class="content-wrapper" bind:this={contentWrapper}>
		<div class="content">
			{#if !vault.depositEnabled()}
				<DepositWarning title="Deposits not enabled">
					This strategy is not using smart contract-based capital management and is not accepting external investments.
				</DepositWarning>
			{:else if geoBlocked}
				<DepositWarning title="Unsupported country">
					Deposits are not supported in {getCountryName(ipCountry)}
				</DepositWarning>
			{:else if !connected}
				<DepositWarning title="Wallet not connected">Please connect wallet to see your deposit status.</DepositWarning>
			{:else if wrongNetwork}
				<DepositWarning title="Wrong network">
					Please connect to {chain.name}.
				</DepositWarning>
			{:else}
				<dl class="balances">
					<VaultBalance {vault} address={$wallet.address!} let:shares let:value on:dataFetch={setVaultBalance}>
						<DepositBalance label="Value" data={value} dollar />
						<DepositBalance label="Shares" data={shares} />
					</VaultBalance>
				</dl>
			{/if}
			<div class="actions">
				{#if vault.depositEnabled() && !connected}
					<Button class="full-width" href={getWizardUrl('connect-wallet')}>
						<IconWallet slot="icon" />
						Connect wallet
					</Button>
				{:else if vault.depositEnabled() && wrongNetwork}
					<Button class="full-width" label="Switch network" on:click={() => switchChain(chain.id)} />
				{/if}
				{#if connected}
					<Button class="mobile full-width" label="Disconnect wallet" on:click={disconnectWallet}>
						<IconUnlink slot="icon" />
					</Button>
				{/if}
				{#if vault.depositEnabled() && (vault.depositMethod === 'external' || strategy.depositExternal)}
					<Button disabled={geoBlocked || isOutdated} href={vault.externalProviderUrl} target="_blank" rel="noreferrer">
						Deposit at {vault.shortLabel}
					</Button>
					<Button secondary disabled={geoBlocked} href={vault.externalProviderUrl} target="_blank" rel="noreferrer">
						Redeem at {vault.shortLabel}
					</Button>
				{:else}
					<Button label="Deposit" disabled={buttonsDisabled || isOutdated} href={getWizardUrl('deposit')} />
					<Button secondary label="Redeem" disabled={buttonsDisabled} href={getWizardUrl('redeem')} />
				{/if}
			</div>
		</div>
	</div>
</div>

<style>
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
		border: 1px solid var(--c-text-light);
		border-radius: var(--radius-md);
		--padding: 1.25rem;
		--gap: 1rem;
		--header-padding: var(--padding) var(--padding) calc(var(--gap) / 2);
		--header-font-size: 1rem;

		&.open {
			--icon-rotation: 180deg;
			--wallet-address-margin-left: 0.625rem;
			--content-height: var(--content-expanded-height);
		}

		&.closed {
			--header-padding: 0.75rem var(--padding);
			--header-translate: calc(-1 * (100% + var(--gap)));
		}

		.mobile {
			--header-font-size: 0.875rem;
		}
	}

	header {
		button {
			display: flex;
			gap: 0.75em;
			align-items: center;
			justify-content: center;
			width: 100%;
			padding: var(--header-padding);
			border: none;
			background: transparent;
			font: var(--f-ui-md-medium);
			letter-spacing: var(--ls-ui-md);
			text-align: left;
			cursor: pointer;
			transition: padding var(--time-md) ease-out;

			.inner {
				flex: 1;
				display: grid;
				grid-template-columns: repeat(3, calc((100% - var(--gap)) / 2));
				gap: var(--gap);
				overflow: hidden;

				> * {
					transition: transform var(--time-md) ease-out;
					transform: translateX(var(--header-translate));
				}
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

			:global(.chevron-down) {
				transition: transform var(--time-md) ease-out;
				transform: rotate(var(--icon-rotation, 0));
			}
		}
	}

	h2 {
		font: var(--f-heading-xs-medium);
		font-size: var(--header-font-size);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--c-text-ultra-light);
		white-space: nowrap;

		&.desktop {
			padding: var(--header-padding);
		}
	}

	.wallet-address {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.75ex;
		align-items: center;
		padding-left: var(--wallet-address-margin-left, 0);
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--ls-ui-sm, normal);
	}

	.content-wrapper {
		display: grid;

		@media (--viewport-sm-down) {
			overflow: hidden;
			height: var(--content-height, 0);
			transition: height var(--time-md) ease-out;
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
		gap: 1rem 0.5rem;
		grid-template-columns: repeat(auto-fit, minmax(7.5rem, 1fr));
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
		:global(.full-width:not(.mobile) ~ .button:not(.full-width)) {
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
