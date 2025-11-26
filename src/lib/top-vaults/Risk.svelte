<script lang="ts">
	interface Props {
		risk: string | null;
	}

	let { risk }: Props = $props();

	let classes = $derived(risk?.toLowerCase().replace(/ /g, '-') ?? 'unknown');
</script>

<span class={classes}>
	{risk ?? 'Unknown'}
</span>

<style>
	span {
		--c-text-base: var(--c-text-light);
		color: color-mix(in srgb, var(--c-text-base), var(--c-risk) 75%);

		&.negligible {
			--c-risk: #13b1c0;
		}

		&.minimal {
			--c-risk: var(--c-success);
		}

		&.low {
			--c-risk: var(--c-warning);
		}

		&.high {
			--c-risk: color-mix(in srgb, var(--c-warning), var(--c-error));
		}

		&.severe {
			--c-risk: var(--c-error);
		}

		&.dangerous {
			--c-risk: #c62847;
			--c-text-base: var(--c-text);
		}

		&.unknown {
			color: var(--c-text-light);
		}
	}
</style>
