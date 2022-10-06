<!--

-->
<script lang="ts">
	import { Icon } from '$lib/components';

	export let title = '';
	export let displayWhen = true;
</script>

{#if displayWhen}
	<li>
		<span class="icon"><Icon name="warning" /></span>
		<span>
			{#if title}
				<strong>{title}:</strong>
			{/if}
			<slot />
		</span>
	</li>
{/if}

<style lang="postcss">
	li :global {
		display: flex;
		gap: 0.75rem;
		font: var(--f-ui-large-roman);
		color: var(--c-text-2);

		& a {
			font-weight: 500;
			text-decoration: underline;

			&:hover {
				color: var(--c-text-1);
			}
		}
	}

	.icon {
		color: var(--c-bearish);
		margin-top: -2px;
	}

	strong {
		font-weight: 500;
		color: var(--c-text-1);
	}
</style>
