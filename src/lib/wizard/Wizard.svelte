<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Step } from './store';
	import Section from '$lib/components/Section.svelte';
	import WizardHeader from './WizardHeader.svelte';
	import WizardNavItem from './WizardNavItem.svelte';
	import WizardActions from './WizardActions.svelte';

	type Props = {
		steps: readonly Step[];
		title: string;
		route: MaybeString;
		children: Snippet;
	};

	let { steps, title, route, children }: Props = $props();

	let stepSlug = $derived(route?.split('/').at(-1));
	let stepIndex = $derived(steps.findIndex(({ slug }: Step) => slug === stepSlug));
	let currentStep = $derived(steps[stepIndex]);
</script>

<svelte:head>
	<title>{title} - {currentStep.slug} | Trading Strategy</title>
	<meta name="description" content="{title} wizard - step {stepIndex + 1}: {currentStep.label}" />
</svelte:head>

<div class="wizard-layout">
	<WizardHeader />

	<Section>
		<div class="inner">
			<nav>
				<h1>{title}</h1>

				<menu>
					{#each steps as { slug, label }, idx}
						<WizardNavItem
							{slug}
							{label}
							active={idx === stepIndex}
							completed={idx < stepIndex}
							disabled={idx > stepIndex}
						/>
					{/each}
				</menu>

				<div class="pagination">
					<span>{stepIndex + 1}</span>
					/
					<span>{steps.length}</span>
				</div>
			</nav>

			<main>
				<h2>{currentStep.label}</h2>
				{@render children()}
				<WizardActions {steps} {currentStep} />
			</main>
		</div>
	</Section>
</div>

<style>
	.wizard-layout {
		display: grid;
		grid-template-rows: auto 1fr;
		gap: var(--space-md);
		min-height: 100vh;
	}

	.inner {
		display: grid;
		padding-bottom: var(--space-4xl);
		overflow: hidden;

		@media (--viewport-md-up) {
			gap: var(--space-3xl);
			grid-template-columns: 22rem auto;
		}

		@media (--viewport-sm-down) {
			gap: var(--space-md);
			grid-auto-rows: auto 1fr;
		}

		:is(h1, h2) {
			font: var(--f-heading-md-medium);
			margin-bottom: var(--space-2xl);
		}
	}

	.inner nav {
		background: var(--c-box-1);
		border-radius: var(--radius-md);
		display: grid;
		align-content: start;
		padding: var(--space-xl);

		@media (--viewport-sm-down) {
			padding: var(--space-md);
		}

		@media (--viewport-sm-down) {
			align-items: center;
			display: flex;
			justify-content: space-between;
		}

		h1 {
			@media (--viewport-sm-down) {
				font: var(--f-heading-xs-medium);
				margin: 0;
			}
		}

		menu {
			display: grid;
			gap: var(--space-ms);
			margin: 0;
			padding: 0;

			@media (--viewport-sm-down) {
				display: none;
			}
		}

		.pagination {
			@media (--viewport-md-up) {
				display: none;
			}
		}
	}

	main {
		width: min(100%, 40rem);
		margin: 2rem auto;

		@media (--viewport-sm-down) {
			margin-block: 1rem;
		}
	}
</style>
