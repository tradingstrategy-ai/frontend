<script>
	import { Section } from '$lib/components';
</script>

<div class="wizard">
	<nav>
		<Section maxWidth="xs" padding="sm">
			<h1>
				<slot name="wizard-title">Wizard title</slot>
			</h1>
			<menu>
				<slot name="navigation" />
			</menu>
		</Section>
	</nav>
	<main>
		<Section maxWidth="xs" padding="sm">
			<div class="step-content">
				<slot name="stepContent" />
			</div>

			<footer>
				<slot name="step-actions" />
			</footer>
		</Section>
	</main>
</div>

<style lang="postcss">
	.wizard {
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
	}

	.wizard :global :is(h1, h2) {
		font: var(--f-heading-md-medium);
		margin-bottom: var(--space-2xl);
	}

	.wizard :global .hash-widget {
		& a {
			@media (--viewport-sm-down) {
				font: var(--f-ui-sm-bold) !important;
			}
		}

		& address {
			@media (--viewport-md-up) {
				max-width: min(32rem, calc(100vw - 35rem));
			}
		}
	}

	.wizard :global h1 {
		@media (--viewport-sm-down) {
			font: var(--f-heading-xs-medium);
			margin: 0;
		}
	}

	.wizard :global section {
		align-content: start;
	}

	nav :global h2 {
		@media (--viewport-sm-down) {
			display: none;
		}
	}

	.wizard :is(nav, main) {
		display: grid;
		gap: var(--space-lg);
		@media (--viewport-sm-up) {
			gap: var(--space-md);
		}
	}

	.wizard nav {
		background: hsla(var(--hsl-box), var(--a-box-a));
		align-content: start;

		& :global .section {
			background: transparent;

			@media (--viewport-sm-down) {
				align-items: center;
				display: flex;
				justify-content: space-between;
			}
		}

		& menu {
			display: grid;
			gap: var(--space-ms);
			margin: 0;
			padding: 0;

			@media (--viewport-sm-down) {
				& :global .wizard-nav-item {
					display: none;
				}
			}
		}
	}

	.wizard main {
		display: grid;
	}

	.wizard :global table {
		@media (--viewport-sm-up) {
			--table-font: var(--f-ui-lg-medium) !important;
		}
	}

	.wizard footer {
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

	.wizard :global table.responsive {
		margin: 0 !important;

		& td {
			align-content: center;
			padding: var(--space-xs) var(--space-ml);

			&:first-child {
				font: var(--f-ui-md-medium);
			}
		}
	}
</style>
