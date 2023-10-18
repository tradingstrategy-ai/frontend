<script lang="ts">
	import { discordUrl, maintenanceNotice } from '$lib/config';
	import { Alert, Button, Section } from '$lib/components';
</script>

{#if maintenanceNotice}
	<Section padding="sm">
		<Alert status="warning" title="Site maintenance">
			{@html maintenanceNotice}
			<Button slot="cta" icon="discord" label="Join Discord" href={discordUrl} target="_blank" rel="noreferrer" />
		</Alert>
	</Section>
{/if}
