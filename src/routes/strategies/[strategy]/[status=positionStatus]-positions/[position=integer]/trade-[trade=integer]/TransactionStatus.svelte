<script lang="ts">
	export let status: boolean;
	export let revert_reason: string | null;
</script>

<span class:failure={!status}>
	{#if status}
		Success
	{:else}
		Failure: {revert_reason}
	{/if}
</span>

<style lang="postcss">
	.failure {
		color: var(--c-error);
	}
</style>
