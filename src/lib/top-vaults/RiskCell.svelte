<script lang="ts">
	import Tooltip from '$lib/components/Tooltip.svelte';

	interface Props {
		risk: string | null;
	}

	const { risk }: Props = $props();

	const riskClass = risk?.toLowerCase().replace(/ /g, '-') ?? 'unknown';
</script>

<span class="risk-cell {riskClass}">
	<Tooltip>
		<svelte:fragment slot="trigger">
			{risk ?? 'Unknown'}
		</svelte:fragment>
		<svelte:fragment slot="popup">
			Read more about
			<a href="/blog/announcing-vault-technical-risk-framework-beta" target="_blank">protocol technical risk</a>
		</svelte:fragment>
	</Tooltip>
</span>

<style>
	.risk-cell {
		font: var(--f-ui-xs-medium);
		letter-spacing: 0.02em;

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

		:global(.popup) {
			right: 0;
			white-space: nowrap;
		}
	}
</style>
