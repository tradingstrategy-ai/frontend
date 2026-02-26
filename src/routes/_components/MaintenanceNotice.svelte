<script lang="ts">
	import { discordUrl, maintenanceNotice } from '$lib/config';
	import { Alert, Button, Section } from '$lib/components';
	import IconDiscord from '~icons/local/discord';
</script>

{#if maintenanceNotice}
	<Section padding="sm">
		<Alert status="warning" title="Site maintenance">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html maintenanceNotice}
			<Button slot="cta" label="Join Discord" href={discordUrl} target="_blank" rel="noreferrer">
				<IconDiscord slot="icon" />
			</Button>
		</Alert>
	</Section>
{/if}
