<script lang="ts">
	import { type Step, wizard } from './store';
	import { Button } from '$lib/components';

	export let steps: Step[];
	export let currentStep: Step;

	$: stepIndex = steps.indexOf(currentStep);
	$: previousStep = steps[stepIndex - 1];
	$: nextStep = steps[stepIndex + 1];
</script>

<footer class="wizard-actions">
	{#if nextStep}
		<Button ghost label="Cancel" href={$wizard.returnTo} disabled={$wizard.completed.has('meta:no-return')} />
	{/if}
	{#if previousStep}
		<Button secondary label="Back" href={previousStep.slug} />
	{/if}
	{#if nextStep}
		<Button label="Next" href={nextStep.slug} disabled={!$wizard.completed.has(currentStep.slug)} />
	{:else}
		<Button label="Done" href={$wizard.returnTo} />
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
