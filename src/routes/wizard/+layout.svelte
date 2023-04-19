<script lang="ts">
	import { page } from '$app/stores';
	import { Section, WizardNavItem } from '$lib/components';
	import Button from '$lib/components/Button.svelte';
	import WizardHeader from '$lib/components/WizardHeader.svelte';

	interface Step {
		slug: string;
		label: string;
	}

	$: steps = $page.data.steps;
	$: currentStep = $page.route.id?.split('/').at(-1);
	$: stepIndex = steps.findIndex(({ slug }: Step) => slug === currentStep);
</script>

<Section class="wizard" maxWidth="xl">
	<WizardHeader />
	<div class="wizard-layout">
		<div class="nav-inner">
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
		</div>

		<main>
			<Section maxWidth="xs" padding="sm">
				<h2>{steps[stepIndex].label}</h2>
				<slot />
			</Section>
		</main>
	</div>
</Section>

<style lang="postcss">
	:global section.wizard .wizard-header {
		margin-bottom: var(--space-md);
	}
	.wizard-layout {
		display: grid;
		background: hsla(var(--hsl-body));
		min-height: calc(100vh - var(--header-height));
		padding-bottom: var(--space-4xl);
		overflow: hidden;
		gap: var(--space-3xl);

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

		& :global .header-bar {
			--header-height: auto !important;
			padding: var(--space-xxs) 0;
			margin-bottom: var(--space-4xl);

			@media (--viewport-sm-down) {
				display: none;
			}
		}

		& :global nav.section {
			@media (--viewport-lg-up) {
				padding-inline: var(--space-6xl);
			}
		}
	}

	.nav-inner {
		background: hsla(var(--hsl-box), var(--a-box-a));
		border-radius: var(--radius-md);
		display: grid;
		align-content: start;
		padding: var(--space-xl);
		@media (--viewport-sm-down) {
			padding: var(--space-md);
		}
		/* @media (--viewport-lg-up) {
			justify-self: end;
			min-width: 20rem;
		} */

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
		/* background: hsla(var(--hsl-box), var(--a-box-a)); */
	}
	main :global .section {
		background: transparent;
		padding-block: var(--space-xl);
		/* @media (--viewport-lg-up) {
			max-width: 20rem;
		} */
	}
	:global footer.section,
	footer {
		display: grid;
		place-content: end stretch;
	}
</style>
