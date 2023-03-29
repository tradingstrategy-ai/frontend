<script lang="ts">
	export let href = '';

	$: tag = href?.length ? 'a' : 'div';

	$: anchorProps = {
		href: href ?? undefined
	};
</script>

<svelte:element this={tag} {...anchorProps} style="display: contents;">
	<li class="usp-tile tile b">
		<strong>
			<slot name="title">Title</slot>
		</strong>
		<span>
			<slot name="subtitle">Title</slot>
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
