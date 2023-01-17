<script lang="ts">
	import { formatUrlAsDomain } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let name: string;
	export let slug: string;
	export let homepage: string;
</script>

<header class="ds-container">
	<h1>
		<img alt={`${name} logo`} src={getLogoUrl(slug)} />
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
			margin-block: var(--space-ll);
		}
	}

	header h1 {
		flex: 1;
		display: flex;
		gap: var(--space-md);
		align-items: center;
		font: var(--f-h1-bold);

		@media (--viewport-md-down) {
			font: var(--f-h3-bold);
		}

		& span {
			display: flex;
			align-items: center;
			min-height: var(--logo-height);
			padding-block: var(--space-ss);
			line-height: 1.2em;
		}

		& img {
			height: var(--logo-height);
		}
	}

	div {
		font: var(--f-ui-lg-medium);
		letter-spacing: var(--f-ui-lg-medium, normal);
	}

	a {
		font: inherit;
		text-decoration: underline;
	}
</style>
