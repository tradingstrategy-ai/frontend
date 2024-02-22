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
		currentMode = document.documentElement.dataset.colorMode ?? 'system';
		open = true;
	}

	function setMode(mode: string) {
		document.documentElement.dataset.colorMode = mode;
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
			<li class={mode} class:active={mode === currentMode}>
				<button on:click={() => setMode(mode)}>{label}</button>
			</li>
		{/each}
	</menu>
</Dialog>

<style lang="postcss">
	menu {
		display: grid;
		margin-block: 1rem 0;
		padding: 0;
	}

	li {
		display: contents;
	}

	button {
		border: none;
		border-radius: var(--radius-xs);
		padding-block: 0.5rem;
		background: inherit;
		font: var(--f-ui-lg-medium);
		letter-spacing: var(--f-ui-lg-spacing, normal);
		color: var(--c-text);
		cursor: pointer;

		.light &:hover {
			background: var(--cm-light, var(--c-background-accent-1)) var(--cm-dark, var(--c-text));
			color: var(--cm-light, var(--c-text)) var(--cm-dark, var(--c-text-inverted));
		}

		.dark &:hover {
			background: var(--cm-dark, var(--c-background-accent-1)) var(--cm-light, var(--c-text));
			color: var(--cm-dark, var(--c-text)) var(--cm-light, var(--c-text-inverted));
		}

		.system &:hover {
			background: var(--c-background-accent-1);
		}

		.active :is(&, &:hover) {
			background: var(--c-box-3);
		}
	}
</style>
