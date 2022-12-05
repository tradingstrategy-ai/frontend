<script lang="ts">
	export let active = false;
	export let label: string;
	export let targetUrl: string;
	export let noScroll = false;

	$: href = active ? undefined : targetUrl;
</script>

<li><a {href} data-sveltekit-noscroll={noScroll ? '' : 'off'} on:click>{label}</a></li>

<style lang="postcss">
	li {
		list-style-type: none;
		justify-content: inherit;
	}

	a {
		display: flex;
		justify-content: inherit;
		align-items: center;
		font: var(--f-ui-xl-medium);
		letter-spacing: var(--f-ui-xl-spacing, normal);
		color: var(--menu-item-color, inherit);
		text-decoration: none;
		white-space: nowrap;
		padding: var(--menu-item-padding, 0.75rem 0rem);
		border-radius: var(--menu-item-border-radius, 0.625rem);

		&:not([href]):not([tabindex]) {
			background: var(--c-background-4);
			color: var(--menu-item-active-color, inherit);
		}
	}

	/*
		Set various properties based on Menu settings (see Menu.svelte CSS classes).
		Some coupling here is acceptable b/c Menu and MenuItem should always be used in tandem.
	*/
	:global(.dir--horizontal) a {
		padding: var(--menu-item-padding, 0.5rem 1rem);
		font: var(--f-ui-lg-medium);
		letter-spacing: var(--f-ui-lg-spacing, normal);
	}
</style>
