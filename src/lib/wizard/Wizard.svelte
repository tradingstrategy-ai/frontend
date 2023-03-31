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
		grid-template-columns: 18rem auto;
		min-height: 32rem;
		overflow: hidden;
	}

	.wizard :global h2 {
		font: var(--f-ui-xl-medium);
		margin-bottom: var(--space-lg);
	}

	.wizard :is(nav, main) {
		display: grid;
		gap: var(--space-md);
		padding: var(--space-ls);
	}

	.wizard nav {
		background: hsla(var(--hsl-box), var(--a-box-a));
		align-content: start;

		& menu {
			display: grid;
			gap: var(--space-sm);
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
		display: grid;
		grid-auto-flow: column;
		gap: var(--space-md);
		margin-top: var(--space-lg);
		place-content: end;
	}
</style>
