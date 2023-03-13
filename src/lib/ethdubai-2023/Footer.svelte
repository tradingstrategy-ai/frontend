<script lang="ts">
	import { Section } from '$lib/components';

	export let skip = false;
</script>

<Section tag="footer" padding="lg">
	<div class="ethdubai-footer">
		<h3>ETH Dubai 2023 Hackathon</h3>
		<p>We ❤️ Sushi!</p>
	</div>
</Section>

<style lang="postcss">
	.ethdubai-footer {
		text-align: center;

		font: var(--f-ui-md-roman);
		letter-spacing: var(--f-ui-md-spacing, normal);

		@media (--viewport-md-up) {
			font: var(--f-ui-lg-roman);
			letter-spacing: var(--f-ui-lg-spacing, normal);
		}

		& h3 {
			font-weight: bold;
		}
	}
</style>
