<script lang="ts">
	import cookies from 'cookie';
	import { addYears } from 'date-fns';
	import { Button, Dialog } from '$lib/components';

	export let showLabel = false;

	const buttonLabel = showLabel ? 'Select color mode' : '';

	let open: boolean;
	let currentMode: string;

	const modes = {
		system: 'Use system setting',
		light: 'Light mode',
		dark: 'Dark mode'
	};

	function openDialog() {
		currentMode = document.body.getAttribute('data-color-mode') ?? 'system';
		open = true;
	}

	function setMode(mode: string) {
		document.body.setAttribute('data-color-mode', mode);
		document.cookie = cookies.serialize('color-mode', mode, {
			secure: false,
			path: '/',
			expires: addYears(new Date(), 1)
		});
		open = false;
	}
</script>

<Button tertiary size="sm" icon="sun" label={buttonLabel} on:click={openDialog} />

<Dialog title="Color Mode" bind:open>
	<menu>
		{#each Object.entries(modes) as [mode, label]}
			<li class={mode} class:active={mode === currentMode} on:click={() => setMode(mode)}>{label}</li>
		{/each}
	</menu>
</Dialog>

<style lang="postcss">
	menu {
		display: grid;
		margin-block: var(--space-md) 0;
		padding: 0;
		list-style-type: none;
	}

	li {
		border-radius: var(--radius-xs);
		padding-block: var(--space-ss);
		font: var(--f-ui-lg-medium);
		letter-spacing: var(--f-ui-lg-spacing, normal);
		color: hsl(var(--hsl-text));
		text-align: center;
		cursor: pointer;

		&.light:hover {
			background: var(--cm-light, hsl(var(--hsla-background-accent-1))) var(--cm-dark, hsl(var(--hsl-text)));
			color: var(--cm-light, hsl(var(--hsl-text))) var(--cm-dark, hsl(var(--hsl-text-inverted)));
		}

		&.dark:hover {
			background: var(--cm-dark, hsl(var(--hsla-background-accent-1))) var(--cm-light, hsl(var(--hsl-text)));
			color: var(--cm-dark, hsl(var(--hsl-text))) var(--cm-light, hsl(var(--hsl-text-inverted)));
		}

		&.system:hover {
			background: hsl(var(--hsla-background-accent-1));
		}

		&.active,
		&.active:hover {
			background: hsl(var(--hsla-box-3));
		}
	}
</style>
