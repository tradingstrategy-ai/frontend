<script lang="ts">
	export let level = 1;
</script>

<header class="page-heading level-{level}">
	<slot />
</header>

<style lang="postcss">
	.page-heading {
		padding-bottom: 2rem;
	}

	.level-1 :global {
		& h1 {
			font: var(--f-heading-xl-medium);
			letter-spacing: var(--f-heading-xl-spacing, normal);
			margin-bottom: 1rem;
		}

		& p {
			font: var(--fs-ui-xl-medium);
			letter-spacing: var(--fs-ui-xl-spacing, normal);
		}
	}

	.level-2 :global {
		& h1 {
			color: var(--c-text-ultra-light);
			font: var(--f-heading-md-medium);
			letter-spacing: var(--f-heading-md-spacing, normal);
			margin-bottom: 0.5rem;

			@media (--viewport-sm-down) {
				font: var(--f-heading-xs-medium);
				letter-spacing: var(--f-heading-xs-spacing, normal);
				margin: 0 0 0.75rem;
			}

			& a {
				font: inherit;

				&:hover {
					text-decoration: underline;
				}
			}
		}

		& h2 {
			font: var(--f-heading-xxxl-medium);
			letter-spacing: var(--f-heading-xxxl-spacing, normal);
			margin: 0;

			@media (--viewport-sm-down) {
				font: var(--f-heading-xl-medium);
				letter-spacing: var(--f-heading-xl-spacing, normal);
			}
		}
	}
</style>
