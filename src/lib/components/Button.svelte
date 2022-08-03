<script lang="ts">
	export let disabled = false;
	export let external = false;
	export let href: string = undefined;
	export let label: string;
	export let secondary = false;
	export let submit = false;
	export let tabindex: number = undefined;
	export let target: string = undefined;
	export let title: string = undefined;

	$: kind = secondary ? 'secondary' : 'primary';
</script>

{#if href && !disabled}
	<a class="kind--{kind}" {href} rel={external ? 'external' : undefined} {tabindex} {target} {title} on:click>
		{label}
	</a>
{:else}
	<button class="kind--{kind}" {disabled} {tabindex} {title} type={submit ? 'submit' : 'button'} on:click>
		{label}
	</button>
{/if}

<style>
	a,
	button {
		display: inline-block;
		padding: 0.8rem 1.25rem 0.7rem;
		border: 1px solid var(--c-background-3);
		border-radius: 0;
		font: 500 var(--fs-ui-md);
		letter-spacing: 0.01em;
		text-decoration: none;
		text-transform: capitalize;
		text-align: center;
		cursor: pointer;
	}

	.kind--primary {
		background: var(--c-background-3);
		color: var(--c-body);
	}

	.kind--secondary {
		background: var(--c-body);
		color: var(--c-background-3);
	}

	a:focus,
	button:focus {
		outline: 2px solid var(--c-border-2);
	}

	a:hover,
	button:hover {
		opacity: 0.8;
	}

	a:active,
	button:active {
		opacity: 0.9;
	}

	button[disabled] {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
