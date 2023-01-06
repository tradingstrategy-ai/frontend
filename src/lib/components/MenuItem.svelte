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
		font: var(--menu-item-font, var(--f-ui-md-medium));
		letter-spacing: var(--f-ui-xl-spacing, normal);
		color: var(--menu-item-color, inherit);
		text-decoration: none;
		white-space: nowrap;
		padding: var(--menu-item-padding, var(--space-sl) 0);
		border-radius: var(--menu-item-border-radius, var(--radius-xs));

		&:not([href]):not([tabindex]) {
			background: hsla(var(--hsl-v2-box), var(--a-v2-box-c));
			color: var(--menu-item-active-color, inherit);
		}

		&:hover {
			background: hsla(var(--hsl-v2-box), var(--a-v2-box-b));
		}
	}

	/*
		Set various properties based on Menu settings (see Menu.svelte CSS classes).
		Some coupling here is acceptable b/c Menu and MenuItem should always be used in tandem.
	*/
	:global(.dir--horizontal) a {
		padding: var(--menu-item-padding, var(--space-ss) var(--space-md));
		font: var(--f-ui-md-medium);
		letter-spacing: var(--f-ui-lg-spacing, normal);
	}
</style>
