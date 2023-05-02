<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import wizard from './wizardState';
	import { initWalletClient } from '$lib/wallet/client';
	import { Section, WizardHeader, WizardNavItem } from '$lib/components';

	if (!wizard?.initializing) {
		const match = $page.route.id?.match(/(\/wizard\/[^/]+)/);
		goto(match[0]);
	}

	wizard.initializing = false;
	initWalletClient();

	interface Step {
		slug: string;
		label: string;
	}

	$: steps = $page.data.steps;
	$: currentStep = $page.route.id?.split('/').at(-1);
	$: stepIndex = steps.findIndex(({ slug }: Step) => slug === currentStep);
</script>

<div class="wizard-layout">
	<WizardHeader />

	<Section>
		<div class="inner">
			<nav>
				<h1>{$page.data.title}</h1>

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
				<Section maxWidth="xs">
					<h2>{steps[stepIndex].label}</h2>
					<slot />
				</Section>
			</main>
		</div>
	</Section>
</div>

<style lang="postcss">
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

		& :is(h1, h2) {
			font: var(--f-heading-md-medium);
			margin-bottom: var(--space-2xl);
		}
	}

	.inner nav {
		background: hsla(var(--hsl-box), var(--a-box-a));
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

		& h1 {
			@media (--viewport-sm-down) {
				font: var(--f-heading-xs-medium);
				margin: 0;
			}
		}

		& menu {
			display: grid;
			gap: var(--space-ms);
			margin: 0;
			padding: 0;

			@media (--viewport-sm-down) {
				display: none;
			}
		}

		& .pagination {
			@media (--viewport-md-up) {
				display: none;
			}
		}
	}

	main {
		--section-padding: var(--space-xl);

		@media (--viewport-sm-down) {
			--section-padding: var(--space-md);
		}
	}
</style>
