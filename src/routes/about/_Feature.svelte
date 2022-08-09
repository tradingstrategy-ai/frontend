<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import { imageUrl } from '$lib/helpers/assets';

	export let title: string;
	export let image: string;
	export let ctaUrl: string | undefined = undefined;
	export let ctaTarget: string | undefined = undefined;

	const imageAsset = imageUrl(`/milano/${image}`);
</script>

<div class="feature">
	<div class="media">
		<img src={imageAsset} alt={title} />
	</div>

	<div class="content">
		<h3>{title}</h3>
		<ul>
			<slot />
		</ul>
		{#if ctaUrl}
			<div class="cta">
				<Button label="See more" href={ctaUrl} target={ctaTarget} />
			</div>
		{/if}
	</div>
</div>

<style>
	.feature {
		display: flex;
		flex-direction: column;
		gap: 2rem 5rem;
	}

	.content {
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 1.5rem;
	}

	.content h3 {
		font: 600 var(--fs-heading-md);
	}

	.content ul {
		display: grid;
		gap: 1.5rem;
		margin: 0;
	}

	.content :global li {
		font: 400 var(--fs-ui-xl);
		margin: 0;
	}

	.content .cta {
		display: grid;
	}

	.media {
		display: flex;
		justify-content: center;
	}

	.media img {
		object-fit: fill;
		width: 100%;
		max-width: 480px;
	}

	@media (--viewport-md-up) {
		.content .cta {
			align-self: center;
		}
	}

	@media (--viewport-lg-up) {
		.feature {
			flex-direction: row;
		}

		.feature:nth-child(even) {
			flex-direction: row-reverse;
		}

		.feature > * {
			flex: 1;
		}

		.content {
			gap: 2rem;
		}

		.content .cta {
			align-self: start;
		}

		.media img {
			width: 80%;
		}
	}
</style>
