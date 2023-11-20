<script lang="ts">
	import type { PositionFlagMap } from './position-flags';
	import { Tooltip } from '$lib/components';

	// input as getPositionFlags(position)
	export let flags: PositionFlagMap;
</script>

<div class="flags">
	{#each [...flags] as [key, flag], idx}
		{#if idx > 0},{/if}
		<Tooltip>
			<span slot="trigger">
				<span class="flag underline">
					{flag.abbreviation}
				</span>
			</span>

			<div slot="popup" class="tooltip-content">
				{@html flag.helpTextHTML}
			</div>
		</Tooltip>
	{/each}
</div>

<style lang="postcss">
	.flags {
		white-space: nowrap;
		display: flex;
		justify-content: center;
	}

	.flag {
		color: hsl(var(--hsl-text-light));
	}

	/* Style help texts generated in position-flags */
	.tooltip-content :global(h4) {
		font: var(--f-ui-large-medium);
		letter-spacing: var(--f-ui-xxl-spacing, normal);
	}

	/* Style help texts generated in position-flags */
	.tooltip-content :global(ul) {
		margin: var(--space-ss) 0;
	}

	.tooltip-content :global(li) {
		margin: var(--space-ss) 0;
	}
</style>
