<script lang="ts">
	import { navigating, page } from '$app/state';
	import { WizardState, setWizardContext } from '$lib/wizard/state.svelte';
	import Wizard from '$lib/wizard/Wizard.svelte';

	let { data, children } = $props();

	const { slug, title, steps } = data;

	const returnTo = navigating.from?.url.pathname;

	// svelte-ignore non_reactive_update
	let error: any = undefined;

	try {
		setWizardContext(new WizardState(slug, returnTo));
	} catch (e) {
		error = e;
		console.log('Wizard not properly initialized!');
	}
</script>

{#if !error}
	<Wizard {title} {steps} route={page.route.id}>
		{@render children()}
	</Wizard>
{:else}
	Wizard not properly initialized
{/if}
