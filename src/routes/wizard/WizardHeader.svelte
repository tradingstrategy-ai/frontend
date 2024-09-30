<script>
	import { discordUrl } from '$lib/config';
	import { Button, Logo, Section } from '$lib/components';
	import IconDiscord from '~icons/local/discord';

	$: windowInnerWidth = 0;
</script>

<svelte:window bind:innerWidth={windowInnerWidth} />

<Section tag="header" class="wizard-header">
	<div class="inner">
		<a href="/">
			<Logo />
		</a>

		<Button
			size="sm"
			label={windowInnerWidth >= 768 ? 'Get help' : undefined}
			href={discordUrl}
			title="Get helo on Discord"
			target="_blank"
			rel="noreferrer"
		>
			<IconDiscord slot="icon" />
		</Button>
	</div>
</Section>

<style>
	.inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--header-height);
		--logo-height: 2.375rem;

		@media (--nav-collapsed) {
			--logo-height: 2rem;
		}
	}
</style>
