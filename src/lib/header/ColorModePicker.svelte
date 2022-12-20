<script lang="ts">
	import cookies from 'cookie';
	import { addYears } from 'date-fns';
	import { Icon, Dialog } from '$lib/components';

	export let showLabel = false;

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

<button on:click={openDialog} class:showLabel>
	<Icon name="sun" size="24px" />
	<span>Select color mode</span>
</button>

<Dialog title="Color Mode" bind:open>
	<menu>
		{#each Object.entries(modes) as [mode, label]}
			<li class={mode} class:active={mode === currentMode} on:click={() => setMode(mode)}>{label}</li>
		{/each}
	</menu>
</Dialog>

<style>
	button {
		display: flex;
		gap: var(--space-ss);
		justify-content: center;
		border: none;
		padding: 0;
		background: transparent;
		font: var(--f-ui-lg-medium);
		letter-spacing: var(--f-ui-lg-spacing, normal);
		text-transform: capitalize;
		cursor: pointer;
	}

	button.showLabel {
		color: var(--c-text-4-v1);
	}

	button:not(.showLabel) span {
		display: none;
	}

	menu {
		display: grid;
		margin-block: var(--space-md) 0;
		padding: 0;
		list-style-type: none;
	}

	li {
		border-radius: 0.5rem;
		padding-block: var(--space-ss);
		font: var(--f-ui-lg-medium);
		letter-spacing: var(--f-ui-lg-spacing, normal);
		color: var(--c-text-1-v1);
		text-align: center;
		cursor: pointer;
	}

	li.active {
		background: var(--c-background-2-v1);
	}

	li.light:hover {
		background: var(--c-parchment-dark);
		color: var(--c-ink);
	}

	li.dark:hover {
		background: var(--c-ink);
		color: var(--c-parchment);
	}

	@media (prefers-color-scheme: light) {
		li.system:hover {
			background: var(--c-parchment-dark);
			color: var(--c-ink);
		}
	}

	@media (prefers-color-scheme: dark) {
		li.system:hover {
			background: var(--c-ink);
			color: var(--c-parchment);
		}
	}
</style>
