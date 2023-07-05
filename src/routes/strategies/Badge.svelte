<!-- Badge component used for key metrics in strategy tiles -->

<script lang="ts">
	// Text on the badge
	export let text = '';

	// Colour scheme
	export let colourScheme = 'transparent';
</script>

<span class="badge" class:transparent={colourScheme === 'transparent'} class:orange={colourScheme === 'orange'}>
	{text}
</span>

<style lang="postcss">
	.badge {
		display: inline-block;
		font: 700 10px/12px var(--ff-ui);
		text-transform: uppercase;
		padding: 3px 4px;
		vertical-align: middle;
	}

	.transparent {
		color: var(--c-text-light);
	}

	.orange {
		background: orange;
		color: white;
	}
</style>
