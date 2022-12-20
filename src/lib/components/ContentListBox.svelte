<script lang="ts">
	export let title: string;
</script>

<div class="content-list-box">
	<h3>{title}</h3>
	<ul><slot /></ul>
	<div class="cta"><slot name="cta" /></div>
</div>

<style lang="postcss">
	.content-list-box {
		border: 2px solid var(--c-border-2-v1);
		border-radius: var(--radius-xs);
		padding: var(--space-ls);
		display: flex;
		flex-direction: column;
		gap: var(--space-lg);

		@media (--viewport-md-up) {
			padding: var(--space-xl);
			gap: var(--space-xl);
		}
	}

	ul :global {
		flex: 1;
		display: grid;
		gap: var(--space-md);

		& li {
			font: var(--f-ui-md-roman);
			letter-spacing: var(--f-ui-md-spacing, normal);

			@media (--viewport-md-up) {
				font: var(--f-ui-xl-roman);
				letter-spacing: var(--f-ui-xl-spacing, normal);
			}
		}
	}

	.cta {
		display: grid;

		@media (--viewport-md-up) {
			justify-items: center;
		}
	}
</style>
