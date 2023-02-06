<!--
@component
Used to display tabs and associated component content panels

#### Usage
```tsx
	<Tabs tabs={[
		{ id: 'overview', title: 'Overview', component: OverviewComponent },
		{ id: 'details', title: 'Details', component: DetailsComponent }
	]} />
```
-->
<script lang="ts">
	type TabItem = {
		id: string;
		title: string;
		component: ConstructorOfATypedSvelteComponent;
		props?: Record<string, any>;
	};

	export let tabs: TabItem[] = [];

	$: tabsNameUID = `tabs-${(Math.random() + 1).toString(36).substring(7)}`;
</script>

<section id={tabsNameUID}>
	{#each tabs as tab, i}
		<input id="{tab.id}-tab-trigger" type="radio" name={tabsNameUID} checked={i === 0 ? true : null} />
		<label for="{tab.id}-tab-trigger"> {tab.title} </label>
	{/each}

	{#each tabs as tab}
		<div class="tab" id="{tab.id}-tab">
			<svelte:component this={tab.component} {...tab.props} />
		</div>
	{/each}
</section>

<style>
	input {
		display: none;
	}

	input:checked + label {
		background: var(--c-background-4);
		color: var(--c-text-default);
	}

	label {
		display: inline-block;
		border-radius: var(--radius-md);
		color: hsla(var(--hsl-text-extra-light));
		cursor: pointer;
		padding: var(--space-md);
		font: var(--f-ui-lg-medium);
	}

	input:nth-of-type(1):checked ~ .tab:not(:nth-of-type(1)) {
		display: none !important;
	}

	input:nth-of-type(2):checked ~ .tab:not(:nth-of-type(2)) {
		display: none !important;
	}

	.tab {
		padding: var(--tab-padding);
	}
</style>
