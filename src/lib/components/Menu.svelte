<script lang="ts">
	export let horizontal = false;

	type Alignment = 'left' | 'center' | 'right';
	export let align: Alignment = 'left';

	$: direction = horizontal ? 'horizontal' : 'vertical';
</script>

<!-- silence ally warnings (on:click is being forwarded from interactive child elements) -->
<!-- svelte-ignore a11y-click-events-have-key-events a11y-no-noninteractive-element-interactions -->
<menu class="dir--{direction} align--{align}" on:click>
	<slot />
</menu>

<style lang="postcss">
	@custom-media --bigger-gap (width > 1480px);
	@custom-media --smaller-gap (width <= 1260px);
	menu {
		display: flex;
		gap: var(--menu-gap, var(--space-lg));
		@media (--bigger-gap) {
			gap: var(--menu-gap, var(--space-xl));
		}
		@media (--smaller-gap) {
			gap: var(--menu-gap, var(--space-sm));
		}
		margin: 0;
		padding: 0;

		&.dir--vertical {
			flex-direction: column;
		}

		&.dir--horizontal {
			flex-direction: row;
		}

		&.align--left {
			justify-content: left;
		}

		&.align--center {
			justify-content: center;
		}

		&.align--right {
			justify-content: right;
		}
	}
</style>
