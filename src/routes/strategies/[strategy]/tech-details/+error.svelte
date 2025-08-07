<script lang="ts">
	import { page } from '$app/state';
	import { discordUrl } from '$lib/config';
	import Alert from '$lib/components/Alert.svelte';
	import Button from '$lib/components/Button.svelte';
	import IconDiscord from '~icons/local/discord';

	let title = $derived.by(() => {
		let message = page.error?.message;
		message ??= page.status < 500 ? 'Client request error' : 'Internal Error';
		return `${page.status} ${message}`;
	});
</script>

<svelte:head>
	<title>Error: {page.status}</title>
</svelte:head>

<section class="tech-details-error">
	<Alert size="lg" status="error" {title}>
		<pre>{(page.error?.stack ?? ['Unknown error']).join('\n')}</pre>
	</Alert>
	<div class="buttons">
		<Button secondary label="Get help on Discord" href={discordUrl} target="_blank" rel="noreferrer">
			<IconDiscord slot="icon" />
		</Button>
	</div>
</section>

<style>
	.tech-details-error {
		pre {
			margin-top: 1rem !important;
			font: var(--f-code-md-medium);
			white-space: pre-wrap;
		}

		.buttons {
			display: grid;
			place-items: center;
			height: 100%;
		}
	}
</style>
