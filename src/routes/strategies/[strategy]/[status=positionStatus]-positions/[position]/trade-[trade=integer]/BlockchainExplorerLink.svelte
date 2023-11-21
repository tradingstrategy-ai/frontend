<script lang="ts">
	export let baseUrl: string | undefined;
	export let tx_hash: string;

	$: href = getHref(baseUrl, tx_hash);

	function getHref(baseUrl: string | undefined, tx_hash: string) {
		try {
			return new URL(`tx/${tx_hash}`, baseUrl).toString();
		} catch {
			console.error(`Error - invalid baseURL: ${baseUrl}`);
		}
	}
</script>

{#if href}
	<a target="_blank" rel="noreferrer" {href}>
		{tx_hash}
	</a>
{:else}
	{tx_hash}
{/if}

<style lang="postcss">
	a {
		font: inherit;

		&:hover {
			text-decoration: underline;
		}
	}
</style>
