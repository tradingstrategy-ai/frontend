<script lang="ts">
	import type { ApiChain } from '$lib/helpers/chain';
	import type { StrategyRuntimeState } from 'trade-executor/strategy/runtime-state';
	import fsm from 'svelte-fsm';
	import { goto } from '$app/navigation';
	import { switchNetwork } from '@wagmi/core';
	import { wizard } from 'wizard/store';
	import { wallet, DepositBalance, DepositWarning, VaultBalance } from '$lib/wallet';
	import { Button, HashAddress, Icon } from '$lib/components';

	export let strategy: StrategyRuntimeState;
	export let chain: ApiChain;

	let contentWrapper: HTMLElement;
	let contentHeight = 'auto';

	$: contracts = strategy.on_chain_data.smart_contracts;
	$: depositEnabled = [
		contracts.vault,
		contracts.comptroller,
		contracts.payment_forwarder,
		contracts.fund_value_calculator
	].every(Boolean);

	$: connected = $wallet.status === 'connected';
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

	function launchWizard(slug: string) {
		wizard.init(slug, `/strategies/${strategy.id}`, {
			chainId: chain.chain_id,
			strategyName: strategy.name,
			contracts
		});
		goto(`/wizard/${slug}/introduction`);
	}
</script>

<div class="my-deposits {$expandable}" class:connected style:--content-height={contentHeight}>
	<header>
		<h2 class="desktop">My deposits</h2>
		<button class="mobile" on:click={expandable.toggle}>
			<h2>My deposits</h2>
			<div class="wallet-address">
				{#if $wallet.address}
					<Icon name="wallet" size="1.25rem" />
					<HashAddress address={$wallet.address ?? ''} endChars={5} />
				{/if}
			</div>
			<Icon name="chevron-down" size="1.25rem" />
		</button>
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
					<VaultBalance {contracts} address={$wallet.address} let:shares let:value>
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
						on:click={() => switchNetwork({ chainId: chain.chain_id })}
					/>
				{/if}
				{#if connected}
					<Button class="mobile full-width" label="Disconnect wallet" on:click={wallet.disconnect}>
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
				display: none;
			}
		}
		@media (--viewport-md-up) {
			:global(.mobile) {
				display: none;
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

		.closed & {
			--header-padding: 0.75rem var(--padding);
		}

		button {
			display: grid;
			grid-template-columns: 1fr 1fr 1.25rem;
			gap: 0.75em;
			align-items: center;
			width: 100%;
			padding: var(--header-padding);
			border: none;
			background: transparent;
			text-align: left;
			cursor: pointer;
			transition: padding var(--time-md) ease-out;

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
		margin-left: 0.625rem;
		font: var(--f-ui-sm-medium);
		letter-spacing: var(--ls-ui-sm, normal);
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
