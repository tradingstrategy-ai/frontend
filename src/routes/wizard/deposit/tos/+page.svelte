<script lang="ts">
	import { wizard } from 'wizard/store';
	import { Alert, Button, Dialog, SummaryBox } from '$lib/components';

	export let data;
	const { version, tosText } = data;

	const fileName = `tos/v${version}.txt`;

	let fullScreen = false;

	wizard.toggleComplete('tos');
</script>

<div class="deposit-tos">
	{#if !tosText}
		<Alert size="md" status="error" title="Error">Terms of service file not found</Alert>
	{/if}

	<SummaryBox>
		<header slot="header">
			<h2>Version {version}</h2>
			<div class="cta">
				<Button
					size="xs"
					icon="download"
					label="Download"
					disabled={!tosText}
					href={fileName}
					download="Trading Strategy Terms of Service v{version}.txt"
				/>
				<Button
					size="xs"
					icon="fullscreen"
					label="Fullscreen"
					disabled={!tosText}
					on:click={() => (fullScreen = true)}
				/>
			</div>
		</header>
		<pre class="tos-text" class:no-file={!tosText}>
			{#if tosText}
				{tosText}
			{:else}
				Terms of service file not found:
  			&gt; src/lib/assets/{fileName}
			{/if}
		</pre>
	</SummaryBox>

	<Button label="Accept terms" />

	<Dialog bind:open={fullScreen} title="Terms of service">
		<pre class="dialog tos-text">
			{tosText}
		</pre>
	</Dialog>
</div>

<style lang="postcss">
	.deposit-tos {
		:global([data-css-props]) {
			--dialog-width: max(96vw, 25rem);
			--dialog-max-width: 64rem;
		}

		display: grid;
		gap: 2rem;

		@media (--viewport-xs) {
			gap: 1.5rem;
		}

		header[slot='header'] {
			display: flex;
			flex-wrap: wrap;
			gap: 1rem;
			align-items: center;

			h2 {
				flex: 1;
				margin: 0;
				font: var(--f-ui-sm-medium);
				letter-spacing: var(--f-ui-sm-spacing, normal);
				color: hsl(var(--hsl-text-light));
				white-space: nowrap;
			}

			.cta {
				flex: 1;
				display: grid;
				grid-template-columns: auto auto;
				gap: 0.5rem;

				:global(.button) {
					--icon-size: 1rem;
				}

				:global(svg path) {
					stroke-width: 2;
				}
			}
		}

		.tos-text {
			padding: 1.25rem;
			border-radius: 1rem;
			max-height: calc(100vh - 32em);
			min-height: 18rem;
			white-space: pre-line;
			background: hsl(var(--hsla-input-background));
			border: 2px solid hsl(var(--hsla-input-border));
			overflow-y: auto;
			font: var(--f-text-md-regular);
			letter-spacing: var(--f-text-md-spacing, normal);

			@media (--viewport-xs) {
				padding: 1rem;
				max-height: calc(100vh - 34em);
			}
		}

		.dialog {
			max-height: calc(100vh - 8.5em);
		}

		.no-file {
			font: var(--f-mono-md-regular);
			letter-spacing: var(--f-mono-md-spacing, normal);
			color: color-mix(in srgb, hsl(var(--hsl-text)), hsl(var(--hsl-error)) 50%);
		}
	}
</style>
