<script lang="ts">
	import { formatUrlAsDomain } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { Button, Section } from '$lib/components';

	export let entityType = '';
	export let name: string = '';
	export let slug: string;
	export let homepage: string;

	$: processedSlug = slug.replace('-v3', '').replace('-v2', '').replace('-v1', '');
</script>

<Section class="entity-page-header" header layout="boxed">
	<div class="inner">
		<a class="website-cta tile a" href={homepage}>
			<div class="header-text">
				<h1>
					{#if getLogoUrl(processedSlug)}
						<img alt={`${name} logo`} src={getLogoUrl(processedSlug)} />
					{/if}
					<span class="title-text">
						<span>
							<slot name="title">
								<span class="main-title">{name} {entityType}</span>
							</slot>
						</span>
						{#if $$slots.subtitle}
							<span class="subtitle">
								<slot name="subtitle" />
							</span>
						{/if}
					</span>
				</h1>
			</div>
			<div class="actions">
				<slot name="actions" />
			</div>
		</a>
		{#if $$slots['details-left'] || $$slots['details-right']}
			<div class="details">
				<slot name="details-left" />
				<slot name="details-right" />
			</div>
		{/if}
		{#if $$slots.bottom}
			<div class="bottom">
				<slot name="bottom" />
			</div>
		{/if}
	</div>
</Section>

<style lang="postcss">
	.inner {
		display: grid;
		gap: var(--space-lg);
	}

	.actions {
		@media (--viewport-md-down) {
			width: 100%;
		}
	}

	.website-cta {
		--logo-height: 5rem;
		align-items: center;
		display: flex;
		gap: var(--space-md);
		justify-content: space-between;
		padding: var(--space-lg) var(--space-xl);
		text-decoration: none;

		@media (--viewport-md-down) {
			--logo-height: 3.5rem;
			align-items: flex-start;
			gap: var(--space-sl);
			padding: var(--space-ls);
			flex-direction: column;
			margin-top: var(--space-ms);

			& :global .button {
				width: 100%;
			}
		}
	}

	.header-text {
		display: grid;
	}

	.details {
		display: grid;
		gap: var(--space-lg);
		grid-auto-flow: column;

		@media (--viewport-md-down) {
			grid-auto-flow: row;
		}
	}

	.subtitle {
		color: hsla(var(--hsl-text-extra-light));
		font: var(--f-heading-md-medium);
		@media (--viewport-md-down) {
			font: var(--f-ui-md-medium);
		}
	}

	.title-text {
		display: grid;
		@media (--viewport-md-down) {
			gap: var(--space-xxs);
		}
	}

	.inner h1 {
		display: flex;
		gap: var(--space-ll);
		align-items: center;
		font: var(--f-heading-xxl-medium);
		margin: 0;
		min-height: var(--logo-height);
		padding-block: var(--space-ss);

		@media (--viewport-md-down) {
			font: var(--f-heading-lg-medium);
			gap: var(--space-ms);
		}

		& .main-title {
			display: flex;
			align-items: center;
			line-height: 1.2em;
		}

		& img {
			height: var(--logo-height);
			@media (--viewport-md-down) {
				--logo-height: 4rem;
			}
		}
	}

	a {
		font: inherit;
		text-decoration: underline;
	}
</style>
