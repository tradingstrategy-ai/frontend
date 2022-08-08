<script lang="ts">
	import Icon from './Icon.svelte';

	export let disabled = false;
	export let external = false;
	export let href: string = undefined;
	export let icon: string = undefined;
	export let label: string;
	export let secondary = false;
	export let submit = false;
	export let tabindex: number = undefined;
	export let target: string = undefined;
	export let title: string = undefined;

	$: tag = href && !disabled ? 'a' : 'button';
	$: kind = secondary ? 'secondary' : 'primary';
	$: type = submit ? 'submit' : 'button';
</script>

<svelte:element
	this={tag}
	class="button {kind}"
	disabled={disabled || undefined}
	{href}
	rel={external ? 'external' : undefined}
	{tabindex}
	{target}
	{title}
	type={tag === 'button' ? type : undefined}
	on:click
>
	{label}
	{#if icon}<Icon name={icon} />{/if}
</svelte:element>

<style>
	.button {
		display: inline-flex;
		gap: 0.5em;
		justify-content: center;
		align-items: center;
		height: 3.5rem;
		padding: 0 1.5rem;
		border: 1px solid var(--c-background-3);
		border-radius: 0;
		font: 500 var(--fs-ui-md);
		letter-spacing: 0.01em;
		text-decoration: none;
		text-transform: capitalize;
		cursor: pointer;
	}

	.primary {
		background: var(--c-background-3);
		color: var(--c-body);
	}

	.secondary {
		background: var(--c-body);
		color: var(--c-background-3);
	}

	:focus {
		outline: 2px solid var(--c-border-2);
	}

	:hover {
		opacity: 0.8;
	}

	:active {
		opacity: 0.9;
	}

	.button[disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
