<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Button, Section } from '$lib/components';
	import Wizard from '$lib/wizard/Wizard.svelte';
	import WizardIntroduction from '$lib/wizard/WizardIntroduction.svelte';
	import WizardConnectWallet from '$lib/wizard/WizardConnectWallet.svelte';
	import WizardNavItem from '$lib/wizard/WizardNavItem.svelte';
	import type { PageData } from './$types';
	import WizardPayment from '$lib/wizard/WizardPayment.svelte';
	import WizardWalletBalance from '$lib/wizard/WizardWalletBalance.svelte';
	import WizardFinish from '$lib/wizard/WizardFinish.svelte';

	export let data: PageData;

	interface WizardStepData {
		title: string;
		slug: string;
		component: any;
		index: number;
	}

	let steps: Array<WizardStepData> = [
		{
			title: 'Introduction',
			slug: 'introduction',
			component: WizardIntroduction,
			index: 0
		},
		{
			title: 'Connect your wallet',
			slug: 'connect-your-wallet',
			component: WizardConnectWallet,
			index: 1
		},
		{
			title: 'Wallet balance',
			slug: 'wallet-balance',
			component: WizardWalletBalance,
			index: 2
		},
		{
			title: 'Payment',
			slug: 'payment',
			component: WizardPayment,
			index: 3
		},
		{
			title: 'Finish',
			slug: 'finish',
			component: WizardFinish,
			index: 4
		}
	];

	let completedSteps: Array<WizardStepData>;

	$: completedSteps = [];

	$: currentStep = steps?.find((x) => x.slug === data.wizard_step) ?? {
		title: '',
		slug: '',
		index: 0,
		component: null
	};

	$: prevStep = steps[currentStep?.index - 1];

	$: nextStepHref =
		currentStep?.index + 1 < steps.length ? `/wizard/deposit/${steps[currentStep?.index + 1]?.slug}` : '';

	$: prevStepHref = currentStep?.index > 0 ? `/wizard/deposit/${steps[currentStep?.index - 1]?.slug}` : '';

	function handleNavigate(step: any) {
		if (step.index >= currentStep.index) return;
		currentStep = step;
		completedSteps = completedSteps.filter((x) => x?.index < step.index);
	}

	function handleClickNext() {
		completedSteps = [...new Set([...completedSteps, currentStep])];
	}

	function handleClickPrev(step: any) {
		completedSteps = completedSteps.filter((x) => x?.slug !== prevStep.slug);
	}
</script>

<Breadcrumbs />

<Section tag="header" maxWidth="md" padding="xs">
	<h1>Deposit tokens</h1>
</Section>

<Section maxWidth="md">
	<Wizard>
		<svelte:fragment slot="navigation">
			{#each steps as step}
				<WizardNavItem
					canNavigateTo={step.index <= currentStep.index}
					href="/wizard/deposit/{step.slug}"
					state={completedSteps.some((x) => x?.slug === step.slug)
						? 'completed'
						: data.wizard_step?.includes(step.slug)
						? 'active'
						: 'inactive'}
					on:click={() => handleNavigate(step)}
				>
					{step.title}
				</WizardNavItem>
			{/each}
		</svelte:fragment>
		<svelte:fragment slot="stepContent">
			{#if completedSteps.length < steps.length}
				<svelte:component this={currentStep?.component} />
			{:else}
				<h2>Finished!</h2>
			{/if}
		</svelte:fragment>
		<svelte:fragment slot="step-actions">
			<Button ghost>Cancel</Button>
			<Button disabled={prevStepHref?.length <= 0} href={prevStepHref} secondary on:click={handleClickPrev}>Prev</Button
			>
			{#if currentStep?.index + 1 < steps.length}
				<Button disabled={nextStepHref?.length <= 0} href={nextStepHref} on:click={handleClickNext}>Next</Button>
			{:else}
				<Button>Finish</Button>
			{/if}
		</svelte:fragment>
	</Wizard>
</Section>

<style>
	h1 {
		font: var(--f-heading-xl-medium);
	}
</style>
