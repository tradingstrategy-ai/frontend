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
		border-radius: 0.5rem;
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;

		@media (--viewport-md-up) {
			padding: 2rem;
			gap: 2rem;
		}
	}

	ul :global {
		flex: 1;
		display: grid;
		gap: 1rem;

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
