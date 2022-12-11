<script lang="ts">
	export let horizontal = false;

	type Alignment = 'left' | 'center' | 'right';
	export let align: Alignment = 'left';

	$: direction = horizontal ? 'horizontal' : 'vertical';
</script>

<menu class="dir--{direction} align--{align}" on:click>
	<slot />
</menu>

<style lang="postcss">
	menu {
		display: flex;
		gap: var(--menu-gap, 1rem 0.5rem);
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
			justify-content: space-evenly;
		}

		&.align--right {
			justify-content: right;
		}
	}
</style>
