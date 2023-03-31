<script lang="ts">
	export let active = false;
</script>

<div class="wallet-tile tile {active ? 'c' : 'a'}" on:click on:keydown>
	<slot name="logo" />
	<div class="text">
		<h3>
			<slot name="name" />
		</h3>
		<p>
			<slot name="description" />
		</p>
	</div>
</div>

<style>
	.wallet-tile {
		border: 2px hsla(var(--hsl-box), var(--a-box-a)) solid;
		border-radius: var(--radius-sm);
		cursor: pointer;
		display: grid;
		gap: var(--space-lg);
		place-items: center;
		place-content: center;
		padding: var(--space-ls) var(--space-md);
	}

	.text {
		display: grid;
		place-items: center;
		text-align: center;
	}

	h3 {
		font: var(--f-ui-xl-medium);
	}
</style>
