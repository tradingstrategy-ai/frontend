<script lang="ts">
	import Button from '$lib/components/Button.svelte';
</script>

<div class="wizard">
	<nav>
		<h2>
			<slot name="wizard-title">Wizard title</slot>
		</h2>
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
		background: hsla(var(--hsl-box), var(--a-box-a));
		border-radius: var(--radius-md);
		min-height: 32rem;
		overflow: hidden;
		@media (--viewport-sm-up) {
			grid-template-columns: 18rem auto;
		}
	}

	.wizard :global h2 {
		font: var(--f-ui-xl-medium);
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

	.wizard :global td {
		/* height: 3.5rem !important; */
	}

	.wizard :is(nav, main) {
		display: grid;
		gap: var(--space-lg);
		padding: var(--space-md);
		@media (--viewport-sm-up) {
			gap: var(--space-md);
			padding: var(--space-ls);
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
			gap: var(--space-sl);
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
