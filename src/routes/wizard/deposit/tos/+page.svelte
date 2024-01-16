<script lang="ts">
	import { wizard } from 'wizard/store';
	import { Button, SummaryBox } from '$lib/components';
	import tos from 'trade-executor/tos/v1-748f0d0312.txt?raw';

	wizard.toggleComplete('tos');
</script>

<div class="deposit-tos">
	<SummaryBox>
		<header slot="header">
			<!-- TODO: dynamic version/hash based on smart contract -->
			<h2>
				Version 1
				<span>748f0d0312</span>
			</h2>
			<div class="cta">
				<!-- TODO: link to terms version route -->
				<Button size="xs" icon="download" label="Download" href="./tos" download />
				<!-- TODO: open fullscreen (modal dialog) -->
				<Button size="xs" icon="fullscreen" label="Fullscreen" />
			</div>
		</header>
		<div class="tos-text">
			{tos}
		</div>
	</SummaryBox>

	<Button label="Accept terms" />
</div>

<style lang="postcss">
	.deposit-tos {
		display: grid;
		gap: 2rem;

		@media (--viewport-xs) {
			gap: 1.5rem;
		}
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

			span {
				margin-left: 1ex;
				color: hsl(var(--hsl-text-extra-light));
				font-weight: 500;
			}
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
</style>
