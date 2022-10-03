<script lang="ts">
	import { Icon } from '$lib/components';

	export let disabled = false;
	export let download: string | boolean | undefined = undefined;
	export let external = false;
	export let href: string | undefined = undefined;
	export let icon: string | undefined = undefined;
	export let label: string = '';
	export let secondary = false;
	export let submit = false;
	export let tabindex: number | undefined = undefined;
	export let target: string | undefined = undefined;
	export let title: string | undefined = undefined;

	$: tag = href && !disabled ? 'a' : 'button';
	$: kind = secondary ? 'secondary' : 'primary';
	$: type = submit ? 'submit' : 'button';
</script>

<svelte:element
	this={tag}
	class="button {kind}"
	disabled={disabled || undefined}
	download={download === true ? '' : download}
	{href}
	rel={external ? 'external' : undefined}
	{tabindex}
	{target}
	{title}
	type={tag === 'button' ? type : undefined}
	on:click
>
	<slot>{label}</slot>
	{#if icon}<Icon name={icon} />{/if}
</svelte:element>

<style>
	.button {
		display: inline-flex;
		gap: 0.5em;
		justify-content: center;
		align-items: center;
		height: var(--button-height, 3.5rem);
		padding: 0 1.5rem;
		border: 1px solid transparent;
		border-radius: 0.5rem;
		font: 500 var(--fs-ui-lg);
		text-decoration: none;
		text-transform: capitalize;
		text-align: center;
		cursor: pointer;
	}

	.primary {
		background: var(--c-background-3);
		color: var(--c-text-6);
		border-color: var(--c-background-3);
	}

	.secondary {
		background: var(--c-background-5);
		color: var(--c-text-1);
		border-color: var(--c-border-2);
	}

	:focus {
		outline: 2px solid var(--c-background-4);
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
