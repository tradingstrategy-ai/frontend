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

	let wizard: WizardState<typeof dataSchema> | undefined;

	try {
		wizard = new WizardState(slug, returnTo, dataSchema);
		setWizardContext(wizard);
	} catch {
		goto(`/strategies/${strategy.id}/error`, { replaceState: true });
	}

	// Steps after "connect" need a live, correctly-networked wallet (they read balances with the
	// account and sign transactions with the connector). The connect step only completes once that
	// holds, but completion is remembered in sessionStorage, so on a page refresh — or if the wallet
	// disconnects / switches chain mid-flow — the user can be sitting on a step that cannot work.
	// Send them back to the connect step, which shows "Connect wallet" / "Wrong network" as needed.
	//
	// The last step is exempt: it reports an already-completed transaction, so a wallet change at
	// that point is irrelevant and bouncing off a success page would be confusing.
	const connectIndex = steps.findIndex((step: WizardStep) => step.slug === 'connect');

	// `walletSettled` matters: right after a reload wagmi is `connecting`/`reconnecting` while it
	// restores the persisted session, and may take a while if the extension is slow to wake up. That
	// window is not "disconnected" and must not redirect (see tests/integration/wallet/wizard.test.ts).
	let settled = $state(false);
	walletSettled.then(() => (settled = true));

	$effect(() => {
		if (!settled || !wizard || connectIndex < 0) return;

		const stepSlug = page.route.id?.split('/').at(-1);
		const stepIndex = steps.findIndex((step: WizardStep) => step.slug === stepSlug);
		const guarded = stepIndex > connectIndex && stepIndex < steps.length - 1;
		const usable = $wallet.status === 'connected' && $wallet.chainId === chain.id;
		if (!guarded || usable) return;

		wizard.toggleComplete('connect', false);
		goto(`/strategies/${strategy.id}/${slug}/connect`, { replaceState: true });
	});
</script>

<svelte:boundary onerror={(e) => captureException(e)}>
	<Wizard {title} {steps} route={page.route.id}>
		{@render children()}
	</Wizard>
</svelte:boundary>
