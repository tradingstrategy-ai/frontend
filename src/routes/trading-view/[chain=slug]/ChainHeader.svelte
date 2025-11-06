<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Section from '$lib/components/Section.svelte';
	import { formatUrlAsDomain } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	interface Props {
		name: string;
		slug: string;
		homepage: string;
	}

	let { name, slug, homepage }: Props = $props();
</script>

<Section tag="header">
	<a class="inner tile a" href={homepage}>
		<h1>
			<img alt={`${name} logo`} src={getLogoUrl('blockchain', slug)} />
			<span>{name} blockchain</span>
		</h1>
		<Button>Visit {formatUrlAsDomain(homepage)}</Button>
	</a>
</Section>

<style>
	.inner {
		--logo-height: 5rem;
		align-items: center;
		background: var(--c-box-1);
		border-radius: var(--radius-xl);
		display: flex;
		gap: var(--space-md);
		justify-content: space-between;
		padding: var(--space-2xl);
		text-decoration: none;

		@media (--viewport-md-down) {
			--logo-height: 3.5rem;
			padding: var(--space-xl);
			flex-direction: column;
			margin-top: var(--space-ms);

			:global(.button) {
				width: 100%;
			}
		}
	}

	.inner h1 {
		flex: 1;
		display: flex;
		gap: var(--space-xl);
		align-items: center;
		font: var(--f-heading-xl-medium);

		@media (--viewport-md-down) {
			font: var(--f-heading-md-medium);
		}

		span {
			display: flex;
			align-items: center;
			min-height: var(--logo-height);
			padding-block: var(--space-ss);
			line-height: 1.2em;
		}

		img {
			height: var(--logo-height);
		}
	}
</style>
