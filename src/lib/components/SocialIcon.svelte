<script lang="ts">
	import { Icon } from '$lib/components';

	export let name: string;
	export let title = name;
	export let href: string | undefined = undefined;
	export let rel: string | undefined = undefined;
	export let target: string | undefined = undefined;
	export let small = false;

	$: tag = href ? 'a' : 'span';
	$: anchorProps = { href, rel, target };
</script>

<svelte:element this={tag} class="social-icon" class:small {title} {...anchorProps}>
	<Icon {name} />
</svelte:element>

<style lang="postcss">
	.social-icon {
		--social-icon-size: 2.75rem;
		--icon-size: 1.5rem;
		display: flex;
		justify-content: center;
		align-items: center;
		height: var(--social-icon-size);
		width: var(--social-icon-size);
		border: none;
		border-radius: calc(var(--social-icon-size) / 2);
		background: var(--c-text);
		color: var(--c-body);
		transition: opacity 0.15s;

		@media (--viewport-sm-down) {
			--social-icon-size: 2.5rem;
			--icon-size: 1.125rem;
		}

		&.small {
			--social-icon-size: 2.5rem;
			--icon-size: 1.125rem;
		}
	}

	a:hover {
		opacity: 0.9;
		cursor: pointer;
	}
</style>
