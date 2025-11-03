<script lang="ts">
	interface Props {
		risk: string | null;
	}

	const { risk }: Props = $props();

	const riskClass = risk?.toLowerCase().replace(/ /g, '-') ?? 'unknown';
</script>

<div class={['risk', riskClass]}>
	{risk ?? 'Unknown'}
</div>

<style>
	.risk {
		display: inline-grid;
		align-items: center;
		height: 1.375rem;
		padding: 0 0.625rem;
		border-radius: 1rem;
		font: var(--f-ui-xs-medium);
		letter-spacing: 0.02em;
		background: var(--c-text-ultra-light);

		/* custom text color defs that ignore light/dark mode (always light or dark color) */
		--c-always-light: var(--cm-light, var(--c-text-inverted)) var(--cm-dark, var(--c-text));
		--c-always-dark: var(--cm-light, var(--c-text)) var(--cm-dark, var(--c-text-inverted));

		&.negligible {
			background-color: #2d7a2e;
			color: var(--c-always-light);
		}

		&.minimal {
			background-color: #4caf50;
			color: var(--c-text-inverted);
		}

		&.low {
			background-color: #fbc02d;
			color: var(--c-always-dark);
		}

		&.high {
			background-color: #ff9800;
			color: var(--c-text-inverted);
		}

		&.severe {
			background-color: #f4511e;
			color: var(--c-always-light);
		}

		&.dangerous {
			background-color: #c62828;
			color: var(--c-always-light);
		}
	}
</style>
