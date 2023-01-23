<script lang="ts">
	import { Button } from '$lib/components';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let name: string;
	export let exchanges: number;
	export let slug: string;
</script>

<div class="tile b" data-testid="blockchain-tile">
	<img alt={`${name} logo`} src={getLogoUrl(slug)} />
	<div class="content">
		<h2>{name}</h2>
		<h3>{exchanges} exchanges</h3>
	</div>
	<Button label="Details" href={`/trading-view/${slug}`} />
</div>

<style lang="postcss">
	.tile {
		display: flex;
		flex-direction: column;
		gap: var(--space-ll);
		padding: var(--space-3xl) var(--space-xl);
		border-radius: var(--radius-xs);
		text-align: center;
	}

	img {
		justify-self: center;
		height: 5rem;
	}

	.content {
		flex: 1;

		& h2 {
			font: var(--f-heading-md-medium);
			letter-spacing: var(--f-heading-md-spacing, normal);
		}

		& h3 {
			font: var(--f-heading-sm-medium);
			letter-spacing: var(--f-heading-sm-spacing, normal);
			color: var(--c-text-2-v1);
		}
	}
</style>
