<script lang="ts">
	import { Button } from '$lib/components';

	export let name: string;
	export let logo: string;
	export let exchanges: number;
	export let slug: string;
</script>

<div class="tile">
	<img alt={`${name} logo`} src={logo} />
	<div class="content">
		<h2>{name}</h2>
		<h3>{exchanges} exchanges</h3>
	</div>
	<Button label="Details" href={`/trading-view/${slug}`} />
</div>

<style>
	.tile {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
		padding: 2.5rem 2rem;
		background: var(--c-background-1);
		border-radius: 0.5rem;
		text-align: center;
	}

	img {
		justify-self: center;
		height: 5rem;
	}

	.content {
		flex: 1;
	}

	.content h2 {
		font: 600 var(--fs-heading-md);
	}

	.content h3 {
		font: 600 var(--fs-heading-sm);
		color: var(--c-text-2);
	}
</style>
