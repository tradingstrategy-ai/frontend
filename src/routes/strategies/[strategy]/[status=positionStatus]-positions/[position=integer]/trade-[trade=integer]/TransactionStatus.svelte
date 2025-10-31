<script lang="ts">
	interface Props {
		status: boolean;
		revert_reason: string | null;
	}
	let { status, revert_reason }: Props = $props();
</script>

<span class:failure={!status}>
	{#if status}
		Success
	{:else}
		Failure: {revert_reason}
	{/if}
</span>

<style>
	.failure {
		color: var(--c-error);
	}
</style>
