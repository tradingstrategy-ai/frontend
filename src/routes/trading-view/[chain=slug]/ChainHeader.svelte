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
	<div class="inner tile a">
		<h1>
			<img alt={`${name} logo`} src={getLogoUrl('blockchain', slug)} />
			<span>{name} blockchain</span>
		</h1>
		<Button href={homepage} target="_blank" rel="noreferrer">Visit {formatUrlAsDomain(homepage)}</Button>
	</div>
</Section>

<style>
	.inner {
		display: flex;
		gap: 1rem;
		justify-content: space-between;
		align-items: center;
		background: var(--c-box-1);
		border-radius: var(--radius-xl);
		padding: 2.25rem;
		text-decoration: none;
		--logo-height: 5rem;

		@media (--viewport-md-down) {
			flex-direction: column;
			margin-top: 0.875rem;
			padding: 2rem;
			--logo-height: 3.5rem;

			:global(.button) {
				width: 100%;
			}
		}
	}

	.inner h1 {
		flex: 1;
		display: flex;
		gap: 0.625em;
		align-items: center;
		font: var(--f-heading-xl-medium);

		@media (--viewport-md-down) {
			font: var(--f-heading-md-medium);
		}

		span {
			line-height: 1.2em;
		}

		img {
			height: var(--logo-height);
		}
	}
</style>
