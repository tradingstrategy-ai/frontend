<script lang="ts">
	import { Button } from '$lib/components';
	import Wizard from '$lib/wizard/Wizard.svelte';
	import WizardIntroduction from '$lib/wizard/WizardIntroduction.svelte';
	import WizardConnectWallet from '$lib/wizard/WizardConnectWallet.svelte';
	import WizardNavItem from '$lib/wizard/WizardNavItem.svelte';
	import type { PageData } from './$types';
	import WizardPayment from '$lib/wizard/WizardPayment.svelte';
	import WizardWalletBalance from '$lib/wizard/WizardWalletBalance.svelte';
	import WizardFinish from '$lib/wizard/WizardFinish.svelte';
	import { disableScrollHandling, goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data: PageData;

	let windowInnerWidth: number;

	$: paymentProgress = 0;

	$: if (paymentProgress === 1000) {
		completedSteps = [
			...new Set([
				...completedSteps,
				{
					title: 'Payment',
					slug: 'payment',
					component: WizardPayment,
					index: 3
				}
			])
		];
		goto('/wizard/deposit/finish', { noScroll: windowInnerWidth > 1024 });
	}

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

		goto(nextStepHref, { noScroll: windowInnerWidth > 1024 });
	}

	function handleClickPrev(step: any) {
		completedSteps = completedSteps.filter((x) => x?.slug !== prevStep.slug);

		goto(prevStepHref, { noScroll: windowInnerWidth > 1024 });
	}

	onMount(() => {
		disableScrollHandling();
	});
</script>

<svelte:window bind:innerWidth={windowInnerWidth} />

<main>
	<Wizard>
		<svelte:fragment slot="wizard-title">Deposit tokens</svelte:fragment>
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
			<div class="mobile-pagination">
				<span>{currentStep.index + 1}</span>
				/
				<span>{steps.length}</span>
			</div>
		</svelte:fragment>
		<svelte:fragment slot="stepContent">
			{#if completedSteps.length < steps.length}
				<svelte:component this={currentStep?.component} bind:paymentProgress />
			{:else}
				<h2>Finished!</h2>
			{/if}
		</svelte:fragment>
		<svelte:fragment slot="step-actions">
			{#if currentStep.index < steps.length - 2}
				{#if currentStep?.index + 1 < steps.length}
					<Button ghost>Cancel</Button>
					{#if currentStep.index > 0}
						<Button disabled={prevStepHref?.length <= 0} secondary on:click={handleClickPrev}>Back</Button>
					{/if}
					<Button disabled={nextStepHref?.length <= 0} on:click={handleClickNext}>Next</Button>
				{/if}
			{:else if currentStep.index === steps.length - 1}
				<Button>Finish</Button>
			{/if}
		</svelte:fragment>
	</Wizard>
</main>

<style>
	main {
		display: grid;
		gap: var(--space-lg);
	}

	.mobile-pagination {
		@media (--viewport-md-up) {
			display: none;
		}
	}
</style>
