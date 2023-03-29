<script lang="ts">
	export let title: string;
	export let subtitle: string;
	export let href: string | undefined = undefined;

	$: tag = href ? 'a' : 'div';
	$: anchorProps = { href };
</script>

<svelte:element this={tag} {...anchorProps} style="display: contents;">
	<li class="usp-tile tile b">
		<strong>
			{title}
		</strong>
		<span>
			{subtitle}
		</span>
	</li>
</svelte:element>

<style>
	.usp-tile {
		display: grid;
		gap: var(--space-xxxs);
		list-style: none;
		padding: var(--space-md);
		place-content: center;
		text-align: center;
		min-height: 12rem;
	}

	strong {
		font: var(--f-heading-xl-bold);
	}

	span {
		color: hsla(var(--hsl-text-extra-light));
		font: var(--f-ui-xl-medium);
	}
</style>
