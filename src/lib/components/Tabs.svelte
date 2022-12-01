<script>
	/**
	 * @typedef {object} TabItem
	 * @property  {any}  component
	 * @property  {string}  badge
	 * @property  {string}  id
	 * @property {string} title
	 */
	/**
	 * @typedef {TabItem[]} TabsItems
	 * @property  details
	 * @property {string} title
	 */

	let classes = '';
	export { classes as class };

	/**
	 * @type {TabsItems}
	 */
	export let tabs = [];

	$: tabsNameUID = `tabs-${(Math.random() + 1).toString(36).substring(7)}`;
</script>

<section id={tabsNameUID} class={classes ?? null}>
	{#each tabs as tab, i}
		<input id="{tab.id}-tab-trigger" type="radio" name={tabsNameUID} checked={i === 0 ? true : null} />
		<label for="{tab.id}-tab-trigger">
			{tab.title}
			{#if tab?.badge}
				<span class="badge">
					{@html tab.badge}
				</span>
			{/if}
		</label>
	{/each}

	{#each tabs as tab}
		<div class="tab" id="{tab.id}-tab">
			<svelte:component this={tab.component} />
		</div>
	{/each}
</section>

<style>
	section {
		display: flex;
		flex-wrap: wrap;
		padding: 1.25rem 0;
	}

	input {
		display: none;
	}

	input:checked + label {
		background: var(--c-background-4);
		color: var(--c-text);
	}

	label {
		align-items: center;
		display: inline-flex;
		border-radius: var(--border-radius-md);
		color: var(--c-text-extra-light);
		cursor: pointer;
		padding: 0 1rem;
		margin-right: 0.5rem;
		min-height: 3.5rem;
		font: var(--f-ui-lg-medium);
	}

	label:hover {
		background: var(--c-background-5);
	}

	input:nth-of-type(1):checked ~ .tab:not(:nth-of-type(1)) {
		display: none !important;
	}

	input:nth-of-type(2):checked ~ .tab:not(:nth-of-type(2)) {
		display: none !important;
	}

	.badge {
		align-items: center;
		background: var(--c-background-3);
		border: none;
		border-radius: 2rem;
		color: var(--c-text-default);
		display: inline-flex;
		font: var(--f-ui-md-medium);
		height: 1.75rem;
		justify-content: center;
		margin-left: 0.625rem;
		width: 1.75rem;
	}

	input:checked + label .badge {
		background: var(--c-background-1);
		color: var(--c-text-inverted);
	}

	.tab {
		width: 100%;
	}
</style>
