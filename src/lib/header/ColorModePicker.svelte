<script lang="ts">
	import cookies from 'cookie';
	import { addYears } from 'date-fns';
	import { Icon } from '$lib/components';

	export let showLabel = false;

	let dialog: HTMLDialogElement;
	let currentMode: string;

	const modes = {
		system: 'Use system setting',
		light: 'Light mode',
		dark: 'Dark mode'
	};

	function openDialog() {
		currentMode = document.body.getAttribute('data-color-mode') ?? 'system';
		dialog.showModal();
	}

	function setMode(mode: string) {
		document.body.setAttribute('data-color-mode', mode);
		document.cookie = cookies.serialize('color-mode', mode, {
			secure: false,
			path: '/',
			expires: addYears(new Date(), 1)
		});
		dialog.close();
	}
</script>

<button on:click={openDialog} class:showLabel>
	<Icon name="sun" size="24px" />
	<span>Select color mode</span>
</button>

<dialog bind:this={dialog}>
	<heading>
		<h5>Color Mode</h5>
		<button on:click={() => dialog.close()}>
			<Icon name="cancel" size="16px" />
		</button>
	</heading>
	<menu>
		{#each Object.entries(modes) as [mode, label]}
			<li class={mode} class:active={mode === currentMode} on:click={() => setMode(mode)}>{label}</li>
		{/each}
	</menu>
</dialog>

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

	dialog {
		border: none;
		border-radius: 0.75rem;
		background: var(--c-body-v1);
		padding: var(--space-xl);
		width: 300px;
	}

	dialog::backdrop {
		--cm-light-backdrop-color: black;
		--cm-dark-backdrop-color: white;

		background: var(--cm-light-backdrop-color);
		opacity: 0.25;
	}

	@media (prefers-color-scheme: dark) {
		:global(body:not([data-color-mode='light'])) dialog::backdrop {
			background: var(--cm-dark-backdrop-color);
		}
	}

	:global(body[data-color-mode='dark']) dialog::backdrop {
		background: var(--cm-dark-backdrop-color);
	}

	heading {
		display: grid;
		grid-template-columns: auto min-content;
		align-items: center;
		color: var(--c-text-4-v1);
	}

	heading h5 {
		font: var(--f-ui-lg-medium);
		letter-spacing: var(--f-ui-lg-spacing, normal);
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
