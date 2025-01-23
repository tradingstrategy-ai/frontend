<script lang="ts">
	import { navigating, page } from '$app/state';
	import { goto } from '$app/navigation';
	import { captureException } from '@sentry/sveltekit';
	import { WizardState, setWizardContext } from '$lib/wizard/state.svelte';
	import Wizard from '$lib/wizard/Wizard.svelte';

	let { children } = $props();

	const { slug, title, steps, dataSchema, strategy } = page.data;

	const returnTo = navigating.from?.url.pathname;

	try {
		setWizardContext(new WizardState(slug, returnTo, dataSchema));
	} catch (e) {
		goto(`/strategies/${strategy.id}/error`, { replaceState: true });
	}
</script>

<svelte:boundary onerror={(e) => captureException(e)}>
	<Wizard {title} {steps} route={page.route.id}>
		{@render children()}
	</Wizard>
</svelte:boundary>
