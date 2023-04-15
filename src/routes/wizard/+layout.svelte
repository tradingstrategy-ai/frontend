<script lang="ts">
	import { page } from '$app/stores';
	import { Section, WizardNavItem } from '$lib/components';

	interface Step {
		slug: string;
		label: string;
	}

	$: steps = $page.data.steps;
	$: currentStep = $page.route.id?.split('/').at(-1);
	$: stepIndex = steps.findIndex(({ slug }: Step) => slug === currentStep);
</script>

<div class="wizard-layout">
	<Section tag="nav" maxWidth="xs" padding="sm" --section-background="hsla(var(--hsl-box), var(--a-box-a))">
		<div class="nav-inner">
			<h1>Connect wallet</h1>

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
		</div>
	</Section>

	<main>
		<Section maxWidth="xs" padding="sm">
			<h2>{steps[stepIndex].label}</h2>
			<slot />
		</Section>
	</main>
</div>

<style lang="postcss">
	.wizard-layout {
		display: grid;
		background: hsla(var(--hsl-body));
		min-height: 100vh;
		overflow: hidden;

		@media (--viewport-md-up) {
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

	.nav-inner {
		display: grid;
		align-content: start;

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
</style>
