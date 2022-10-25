<script lang="ts">
	import { formatUrlAsDomain } from '$lib/helpers/formatters';

	export let name: string;
	export let logoUrl: string;
	export let homepage: string;
</script>

<header class="ds-container">
	<h1>
		<img alt={`${name} logo`} src={logoUrl} />
		<span>{name} blockchain</span>
	</h1>
	<div>Visit <a href={homepage}>{formatUrlAsDomain(homepage)}</a></div>
</header>

<style lang="postcss">
	header {
		--logo-height: 5rem;
		display: flex;
		align-items: center;

		@media (--viewport-md-down) {
			--logo-height: 3.5rem;
			flex-direction: column;
			margin-block: 1.75rem;
		}
	}

	header h1 {
		flex: 1;
		display: flex;
		gap: 1rem;
		align-items: center;
		font: var(--f-h1-bold);

		@media (--viewport-md-down) {
			font: var(--f-h3-bold);
		}

		& span {
			display: flex;
			align-items: center;
			min-height: var(--logo-height);
			padding-block: 0.5rem;
			line-height: 1.2em;
		}

		& img {
			height: var(--logo-height);
		}
	}

	div {
		font: 500 var(--fs-ui-lg);
	}

	a {
		font: inherit;
		text-decoration: underline;
	}
</style>
