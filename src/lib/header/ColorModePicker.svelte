<script lang="ts">
	import type { ColorMode } from '$lib/schemas/utility';
	import Button from '$lib/components/Button.svelte';
	import Dialog from '$lib/components/Dialog.svelte';
	import IconSun from '~icons/local/sun';
	import { getColorMode, setColorMode } from '$lib/helpers/style';

	type Props = {
		showLabel?: boolean;
	};

	let { showLabel = false }: Props = $props();

	const buttonLabel = 'Select color mode';

	let open = $state(false);
	let currentMode = $state<ColorMode>('dark');

	const modes = {
		system: 'Use system setting',
		light: 'Light mode',
		dark: 'Dark mode'
	} as const;

	function openDialog() {
		currentMode = getColorMode();
		open = true;
	}

	function setMode(mode: ColorMode) {
		setColorMode(mode);
		open = false;
	}
</script>

<Button
	tertiary
	size="sm"
	label={showLabel ? buttonLabel : ''}
	title={showLabel ? undefined : buttonLabel}
	on:click={openDialog}
>
	<IconSun slot="icon" />
</Button>

<div class="color-mode-picker">
	<Dialog title="Color Mode" bind:open>
		<menu>
			{#each Object.entries(modes) as [mode, label]}
				<li class={mode} class:active={mode === currentMode}>
					<button onclick={() => setMode(mode as ColorMode)}>{label}</button>
				</li>
			{/each}
		</menu>
	</Dialog>
</div>

<style>
	.color-mode-picker {
		display: contents;

		:global([data-css-props]) {
			--dialog-max-width: 20rem;
		}
	}

	menu {
		display: grid;
		margin: 0;
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
