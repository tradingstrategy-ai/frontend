<script lang="ts">
	export let horizontal = false;

	type Alignment = 'left' | 'center' | 'right';
	export let align: Alignment = 'left';

	$: direction = horizontal ? 'horizontal' : 'vertical';
</script>

<menu class="dir--{direction} align--{align}" on:click>
	<slot />
</menu>

<style>
	menu {
		display: flex;
		gap: var(--menu-gap, 2rem 0.5rem);
		margin: 0;
		padding: 0;
	}

	menu.dir--vertical {
		flex-direction: column;
	}

	menu.dir--horizontal {
		flex-direction: row;
	}

	menu.align--left {
		justify-content: left;
	}

	menu.align--center {
		justify-content: space-evenly;
	}

	menu.align--right {
		justify-content: right;
	}
</style>
