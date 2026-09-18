<!--
Strategy wizard frame (deposit, redeem, connect-wallet): wizard state, step navigation and the
wallet guard that returns the user to the connect step when the wallet is unusable.
-->
<script lang="ts">
	import type { WizardStep } from '$lib/wizard/WizardActions.svelte';
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';
	import { captureException } from '@sentry/sveltekit';
	import { WizardState, setWizardContext } from '$lib/wizard/state.svelte';
	import { wallet, walletSettled } from '$lib/wallet/client';
	import Wizard from '$lib/wizard/Wizard.svelte';

	let { children } = $props();

	const { slug, title, steps, dataSchema, strategy, chain } = page.data;

	const returnTo = navigating.from?.url.pathname;

	try {
		setWizardContext(new WizardState(slug, returnTo, dataSchema));
	} catch {
		goto(`/strategies/${strategy.id}/error`, { replaceState: true });
	}

	// Steps after "connect" (bar the final one, which only reports a finished transaction) need a
	// wallet connected on the strategy's chain. The connect step checks that before it completes,
	// but completion is remembered in sessionStorage: after a page refresh, or if the wallet
	// disconnects or switches chain mid-flow, the user can be sitting on a step that cannot work.
	// Send them back to the connect step, which shows "Connect wallet" / "Wrong network" as needed.
	//
	// Wait for the wallet to settle first: right after a reload wagmi is still restoring the
	// persisted session, which can take a while with a slow extension, and that window must not be
	// mistaken for "disconnected" (see tests/integration/wallet/wizard.test.ts).
	const connectIndex = steps.findIndex((step: WizardStep) => step.slug === 'connect');

	let settled = $state(false);
	walletSettled.then(() => (settled = true));

	$effect(() => {
		if (!settled || connectIndex < 0) return;

		const stepSlug = page.route.id?.split('/').at(-1);
		const stepIndex = steps.findIndex((step: WizardStep) => step.slug === stepSlug);
		const guarded = stepIndex > connectIndex && stepIndex < steps.length - 1;
		const usable = $wallet.status === 'connected' && $wallet.chainId === chain.id;

		if (guarded && !usable) goto(`/strategies/${strategy.id}/${slug}/connect`, { replaceState: true });
	});
</script>

<svelte:boundary onerror={(e) => captureException(e)}>
	<Wizard {title} {steps} route={page.route.id}>
		{@render children()}
	</Wizard>
</svelte:boundary>
