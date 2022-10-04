<script lang="ts">
	export let active = false;
	export let label: string;
	export let targetUrl: string;

	$: href = active ? undefined : targetUrl;
</script>

<li><a {href} on:click>{label}</a></li>

<style lang="postcss">
	li {
		list-style-type: none;
		justify-content: inherit;
	}

	a {
		display: flex;
		justify-content: inherit;
		align-items: center;
		box-sizing: border-box;
		font: 500 var(--fs-ui-xl);
		color: inherit;
		text-decoration: none;
		white-space: nowrap;
		/* default padding for vertical left/right aligned */
		padding: 0.75rem 0rem;
		background: var(--c-background-5);

		&:not([href]) {
			background: var(--c-background-4);
		}

		&[href]:hover {
			background: var(--c-background-1);
		}
	}

	/*
		Set various properties based on Menu settings (see Menu.svelet CSS classes).
		Some coupling here is acceptable b/c Menu and MenuItem should always be used in tandem.
	*/
	:global(.dir--vertical.align--center) a {
		border-radius: 0.625rem;
	}

	:global(.dir--horizontal) a {
		padding: 0.5rem 1rem;
		border-radius: 0.625rem;
		font: 500 var(--fs-ui-lg);
	}
</style>
