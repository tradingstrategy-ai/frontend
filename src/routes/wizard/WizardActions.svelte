<script lang="ts">
	import { type Step, wizard } from './store';
	import { Button } from '$lib/components';
	import { goto } from '$app/navigation';

	export let steps: Step[];
	export let currentStep: Step;

	async function exitWizard() {
		await goto($wizard.returnTo!);
		wizard.reset();
	}

	$: stepIndex = steps.indexOf(currentStep);
	$: previousStep = steps[stepIndex - 1];
	$: nextStep = steps[stepIndex + 1];
</script>

<footer class="wizard-actions">
	{#if nextStep}
		<Button ghost label="Cancel" disabled={$wizard.completed?.has('meta:no-return')} on:click={exitWizard} />
	{/if}
	{#if previousStep}
		<Button secondary label="Back" on:click={() => goto(previousStep.slug)} />
	{/if}
	{#if nextStep}
		<Button label="Next" on:click={() => goto(nextStep.slug)} disabled={!$wizard.completed?.has(currentStep.slug)} />
	{:else}
		<Button label="Done" on:click={exitWizard} />
	{/if}
</footer>

<style lang="postcss">
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
