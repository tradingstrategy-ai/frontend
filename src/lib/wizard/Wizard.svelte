<div class="wizard">
	<nav>
		<h1>
			<slot name="wizard-title">Wizard title</slot>
		</h1>
		<menu>
			<slot name="navigation" />
		</menu>
	</nav>
	<main>
		<div class="step-content">
			<slot name="stepContent" />
		</div>

		<footer>
			<slot name="step-actions" />
		</footer>
	</main>
</div>

<style lang="postcss">
	.wizard {
		display: grid;
		background: hsla(var(--hsl-body));
		/* background: hsla(var(--hsl-box), var(--a-box-a)); */
		min-height: 100vh;
		overflow: hidden;
		@media (--viewport-sm-up) {
			grid-template-columns: 18rem auto;
		}
	}

	.wizard :global :is(h1, h2) {
		font: var(--f-heading-md-medium);
		margin-bottom: var(--space-lg);
	}

	main :global h2 {
		@media (--viewport-sm-down) {
			font: var(--f-ui-xxl-medium) !important;
		}
	}

	nav :global h2 {
		@media (--viewport-sm-down) {
			display: none;
		}
	}

	.wizard :is(nav, main) {
		display: grid;
		gap: var(--space-lg);
		padding: var(--space-md);
		@media (--viewport-sm-up) {
			gap: var(--space-md);
			padding: var(--space-lg);
		}
	}

	.wizard nav {
		background: hsla(var(--hsl-box), var(--a-box-a));
		align-content: start;

		@media (--viewport-sm-down) {
			padding-block: var(--space-xs) !important;
			order: 2;
		}

		& menu {
			display: grid;
			gap: var(--space-ms);
			padding: 0;
		}

		& h2 {
			margin: 0;
		}
	}

	.wizard main {
		display: grid;
	}

	.wizard footer {
		display: flex;
		gap: var(--space-md);
		justify-content: flex-end;
		@media (--viewport-sm-down) {
			margin-block: var(--space-md);
		}
		@media (--viewport-sm-up) {
			display: grid;
			grid-auto-flow: column;
			margin-top: var(--space-lg);
			place-content: end;
		}
	}
</style>
