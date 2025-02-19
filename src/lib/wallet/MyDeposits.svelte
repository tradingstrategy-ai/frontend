<script lang="ts">
	import type { Chain } from '$lib/helpers/chain';
	import type { ConnectedStrategyInfo } from 'trade-executor/models/strategy-info';
	import type { BaseAssetManager } from 'trade-executor/vaults/base';
	import { MediaQuery } from 'svelte/reactivity';
	import { slide } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import { disconnect, switchChain, wallet, config } from '$lib/wallet/client';
	import Button from '$lib/components/Button.svelte';
	import HashAddress from '$lib/components/HashAddress.svelte';
	import DepositWarning from './DepositWarning.svelte';
	import DepositBalance from './DepositBalance.svelte';
	import PendingExchangeInfo from './PendingExchangeInfo.svelte';
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

	const isOutdated = Boolean(strategy.newVersionId);

	let connected = $derived($wallet.status === 'connected');
	let address = $derived($wallet.address);
	let wrongNetwork = $derived(connected && $wallet.chain?.id !== chain.id);
	let buttonsDisabled = $derived(!vault.depositEnabled() || geoBlocked || wrongNetwork);

	let depositBalancesVersion = $state(0);
	const invalidateBalances = () => depositBalancesVersion++;

	let [shareBalance, shareValue] = $derived.by(() => {
		if (!(vault.depositEnabled() && address && !wrongNetwork)) return [undefined, undefined];

		// force update to dervived values when deposit values invalidated
		depositBalancesVersion;
		const shares = vault.getShareBalance(config, address);
		const value = vault.getShareValueUSD(config, address);
		return [shares, value];
	});

	const desktop = new MediaQuery('width > 768px', true);
	let mobileOpen = $state(false);

	function disconnectWallet() {
		disconnect();
		mobileOpen = false;
	}

	function getWizardUrl(slug: string) {
		return `/strategies/${strategy.id}/${slug}/introduction`;
	}
</script>

<div class={['my-deposits', mobileOpen ? 'open' : 'closed', desktop.current && 'desktop']}>
	<header>
		<h2 class="desktop">My deposits</h2>
		{#if connected}
			<button class="mobile" onclick={() => (mobileOpen = !mobileOpen)}>
				<div class="inner">
					<h2>My deposits</h2>
					<div class="wallet-address">
						{#if address}
							<IconWallet --icon-size="1.25rem" />
							<HashAddress {address} endChars={5} />
						{/if}
					</div>
					{#if shareValue}
						{#await shareValue}
							<div class="vault-balance skeleton"></div>
						{:then balance}
							<div class="vault-balance">
								{formatDollar(formatBalance(balance))}
							</div>
						{:catch e}
							<div class="vault-balance">---</div>
						{/await}
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
	{#if desktop.current || mobileOpen}
		<div class="content" transition:slide={{ duration: 250 }}>
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
			{:else if shareValue && shareBalance}
				<dl class="balances">
					<DepositBalance label="Value" data={shareValue} dollar />
					<DepositBalance label="Shares" data={shareBalance} />
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
			{#if address && vault.internalDepositEnabled() && vault.requiresSettlement()}
				<!-- force re-render of PendingExchangeInfo when address changes -->
				{#key address}
					<PendingExchangeInfo type="deposit" {vault} {address} {invalidateBalances} />
					<PendingExchangeInfo type="redemption" {vault} {address} {invalidateBalances} />
				{/key}
			{/if}
		</div>
	{/if}
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

	.content {
		display: grid;
		grid-template-rows: 1fr auto;
		gap: var(--gap);
		padding: calc(var(--gap) / 2) var(--padding) var(--padding);

		/* Prevent FOUC on mobile when JS MediaQuery value is hydrating */
		@media (--viewport-sm-down) {
			.desktop.closed & {
				display: none;
			}
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
