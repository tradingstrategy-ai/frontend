<script>
	import { MediaQuery } from 'svelte/reactivity';
	import { discordUrl } from '$lib/config';
	import { Button, Logo, Section } from '$lib/components';
	import IconDiscord from '~icons/local/discord';

	const large = new MediaQuery('width > 768px');
</script>

<Section tag="header" class="wizard-header">
	<div class="inner">
		<a href="/" aria-label="Home">
			<Logo />
		</a>

		<Button
			size="sm"
			label={large.current ? 'Get help' : undefined}
			href={discordUrl}
			title="Get help on Discord"
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
