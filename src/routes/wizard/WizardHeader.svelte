<script>
	import { discordUrl } from '$lib/config';
	import { Button, Logo, Section } from '$lib/components';

	$: windowInnerWidth = 0;
</script>

<svelte:window bind:innerWidth={windowInnerWidth} />

<Section tag="header" class="wizard-header">
	<div class="inner">
		<a href="/">
			<Logo />
		</a>

		<Button
			href={discordUrl}
			icon="discord"
			label={windowInnerWidth >= 768 ? 'Get help' : undefined}
			size="sm"
			target="_blank"
			rel="noreferrer"
		/>
	</div>
</Section>

<style lang="postcss">
	.inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--header-height);

		@media (--viewport-md-up) {
			--logo-height: 2.375rem;
		}

		@media (--nav-collapsed) {
			--logo-height: 2rem;
		}
	}
</style>
