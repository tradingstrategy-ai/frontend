<script module lang="ts">
	export type WizardStep = {
		slug: string;
		label: string;
	};
</script>

<script lang="ts">
	import { getWizardContext } from '$lib/wizard/state.svelte';
	import { Button } from '$lib/components';
	import { goto } from '$app/navigation';

	interface Props {
		steps: WizardStep[];
		currentStep: WizardStep;
	}

	let { steps, currentStep }: Props = $props();

	const wizard = getWizardContext();

	let stepIndex = $derived(steps.indexOf(currentStep));
	let previousStep = $derived(steps[stepIndex - 1]);
	let nextStep = $derived(steps[stepIndex + 1]);
</script>

<footer class="wizard-actions">
	{#if nextStep}
		<Button
			ghost
			label="Cancel"
			disabled={wizard.hasCompleted('meta:no-return')}
			on:click={() => goto(wizard.returnTo)}
		/>
	{/if}
	{#if previousStep}
		<Button secondary label="Back" on:click={() => goto(previousStep.slug)} />
	{/if}
	{#if nextStep}
		<Button label="Next" on:click={() => goto(nextStep.slug)} disabled={!wizard.hasCompleted(currentStep.slug)} />
	{:else}
		<Button label="Done" on:click={() => goto(wizard.returnTo)} />
	{/if}
</footer>

<style>
	.wizard-actions {
		display: flex;
		gap: var(--space-md);
		justify-content: flex-end;

		@media (--viewport-sm-down) {
			margin-block: var(--space-4xl);
		}

		@media (--viewport-sm-up) {
			display: grid;
			grid-auto-flow: column;
			margin-top: var(--space-3xl);
			place-content: end;
		}
	}
</style>
