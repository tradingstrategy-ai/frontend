<!--
@component
Table cell showing the Xerberus Dendrogram protocol composite score.
Renders a dash when Xerberus does not publish a score for the protocol.

@example

```svelte
  <XerberusRiskCell score={0.784} url="https://app.xerberus.io/protocol/dendrogram/morpho-v1" />
```
-->
<script lang="ts">
	import Tooltip from '$lib/components/Tooltip.svelte';
	import { formatXerberusScore, getXerberusScoreBand, getXerberusScoreColour } from './helpers';

	interface Props {
		score?: number | null;
		url?: string | null;
	}

	let { score = null, url = null }: Props = $props();

	let label = $derived(formatXerberusScore(score));
	let band = $derived(getXerberusScoreBand(score));
	let colour = $derived(getXerberusScoreColour(score));
</script>

{#if score == null}
	<span class="empty">–</span>
{:else}
	<span class="xerberus-risk-cell">
		<Tooltip>
			<svelte:fragment slot="trigger">
				<span class="score" style:--xerberus-score-colour={colour}>{label}</span>
			</svelte:fragment>
			<svelte:fragment slot="popup">
				Xerberus Dendrogram overall protocol score on a 0 to 100 scale. Higher scores mean lower risk.
				{#if band}
					Risk band: <strong>{band}</strong>.
				{/if}
				{#if url}
					<a href={url} target="_blank" rel="noreferrer">View scorecard</a>
				{/if}
			</svelte:fragment>
		</Tooltip>
	</span>
{/if}

<style>
	.score {
		font-weight: 600;
		color: var(--xerberus-score-colour, var(--c-text-light));
	}

	.empty {
		color: var(--c-text-extra-light);
	}

	:global(.xerberus-risk-cell .tooltip .popup) {
		max-width: 400px;
	}
</style>
