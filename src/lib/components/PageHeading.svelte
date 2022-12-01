<header>
	<slot />
</header>

<style lang="postcss">
	header :global {
		margin-bottom: 2rem;

		& h1 {
			font: var(--fs-heading-xl);
			font-weight: 600;
			margin-bottom: 1rem;
		}

		& p {
			font: var(--fs-ui-xl);
		}
	}
</style>
