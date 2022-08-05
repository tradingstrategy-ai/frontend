<script lang="ts">
	export let title: string;
</script>

<div class="content-list-box">
	<h3>{title}</h3>
	<ul><slot /></ul>
	<div class="cta"><slot name="cta" /></div>
</div>

<style>
	.content-list-box {
		border: 2px solid var(--c-border-1);
		padding: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	ul {
		margin: 0;
		flex: 1;
		display: grid;
		gap: 1rem;
	}

	.content-list-box :global li {
		margin: 0;
		font: 400 var(--fs-ui-md);
		letter-spacing: 0.01em;
	}

	.cta {
		display: grid;
	}

	@media (--viewport-md-up) {
		.content-list-box {
			padding: 2rem;
			gap: 2rem;
		}

		h3 {
			text-align: left;
		}

		.content-list-box :global li {
			font: 400 var(--fs-ui-xl);
			letter-spacing: 0;
		}

		.cta {
			justify-items: center;
		}
	}
</style>
