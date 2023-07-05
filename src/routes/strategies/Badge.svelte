<!-- Badge component used for key metrics in strategy tiles -->

<script lang="ts">
	// Text on the badge
	export let text = '';

	// Colour scheme
	export let colourScheme = 'grey';
</script>

<span class="badge" class:grey={colourScheme === 'grey'} class:orange={colourScheme === 'orange'}>
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

	.grey {
		//background: var(--c-background-1);
		color: var(--c-text-light);
	}

	.orange {
		background: orange;
		color: white;
	}
</style>
