<script lang="ts">
	export let active = false;
	export let label: string = '';
	export let targetUrl: string;
	export let external = false;

	$: href = active ? undefined : targetUrl;
	$: rel = external ? 'external' : undefined;
</script>

<li class="menu-item">
	<a {href} {rel} on:click>
		<slot>{label}</slot>
	</a>
</li>

<style>
	.menu-item {
		list-style-type: none;
		justify-content: inherit;
	}

	a {
		display: flex;
		justify-content: inherit;
		align-items: center;
		font: var(--menu-item-font, var(--f-ui-md-medium));
		letter-spacing: var(--menu-item-letter-spacing, var(--ls-ui-md, var(--f-ui-md-spacing, normal)));
		color: var(--menu-item-color, inherit);
		text-decoration: none;
		white-space: nowrap;
		padding: var(--menu-item-padding, var(--space-sl) 0);
		border-radius: var(--menu-item-border-radius, var(--radius-xs));

		&:not([href]):not([tabindex]) {
			background: var(--c-box-3);
			color: var(--menu-item-active-color, inherit);
		}

		&:hover {
			background: var(--c-box-2);
		}
	}

	/*
		Set various properties based on Menu settings (see Menu.svelte CSS classes).
		Some coupling here is acceptable b/c Menu and MenuItem should always be used in tandem.
	*/
	:global(.dir--horizontal) a {
		padding: var(--menu-item-padding, var(--space-ss) var(--space-md));
	}
</style>
