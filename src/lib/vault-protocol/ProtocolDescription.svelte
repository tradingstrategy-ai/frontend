<!--
  Expandable protocol description widget with social/documentation links.
  Used on vault protocol detail pages to display protocol metadata.
-->
<script lang="ts">
	import { micromark } from 'micromark';
	import type { VaultProtocolMetadata } from './schemas';
	import IconTwitter from '~icons/local/twitter';
	import IconGithub from '~icons/local/github';
	import IconBook from '~icons/local/book';
	import IconArrowRightUp from '~icons/local/arrow-right-up';

	interface Props {
		metadata: VaultProtocolMetadata;
	}

	let { metadata }: Props = $props();

	let expanded = $state(false);

	const hasExpandableContent = $derived(metadata.long_description !== metadata.short_description);

	const links = $derived(
		[
			{ href: metadata.links.homepage, label: 'Homepage', icon: IconArrowRightUp },
			{ href: metadata.links.twitter, label: 'Twitter', icon: IconTwitter },
			{ href: metadata.links.documentation, label: 'Documentation', icon: IconBook },
			{ href: metadata.links.github, label: 'GitHub', icon: IconGithub }
		].filter((link) => link.href)
	);
</script>

<div class="protocol-description">
	<h2>About {metadata.name}</h2>

	<div class="description-text">
		<p>{metadata.short_description}</p>
		{#if hasExpandableContent}
			<button class="toggle-btn" onclick={() => (expanded = !expanded)}>
				{expanded ? 'View less' : 'View more'}
			</button>
		{/if}
	</div>

	{#if expanded}
		<div class="long-description">
			{@html micromark(metadata.long_description)}
		</div>

		{#if links.length > 0}
			<div class="links">
				{#each links as link}
					<a href={link.href} target="_blank" rel="noopener noreferrer">
						<svelte:component this={link.icon} />
						<span>{link.label}</span>
					</a>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	.protocol-description {
		display: grid;
		gap: var(--space-md);
		padding: 1.25rem;
		background: var(--c-box-1);
		border: 1px solid var(--c-box-3);
		border-radius: var(--radius-md);

		h2 {
			margin: 0;
			font: var(--f-heading-xs-medium);
			font-size: 1rem;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			color: var(--c-text-ultra-light);

			@media (--viewport-sm-down) {
				font-size: 0.875rem;
			}
		}
	}

	.description-text {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: var(--space-sm);

		p {
			margin: 0;
			font: var(--f-ui-md-roman);
			color: var(--c-text-light);
		}
	}

	.long-description {
		font: var(--f-ui-md-roman);
		color: var(--c-text-light);

		:global(p) {
			margin: 0 0 1em;

			&:last-child {
				margin-bottom: 0;
			}
		}

		:global(a) {
			color: var(--c-text);
			text-decoration: underline;
		}

		:global(ul),
		:global(ol) {
			margin: 0 0 1em;
			padding-left: 1.5em;
		}

		:global(li) {
			margin-bottom: 0.25em;
		}

		:global(strong) {
			font-weight: 600;
		}

		:global(code) {
			font-family: var(--ff-mono);
			background: var(--c-box-2);
			padding: 0.125em 0.25em;
			border-radius: var(--radius-xs);
		}
	}

	.toggle-btn {
		background: none;
		border: none;
		padding: 0;
		font: var(--f-ui-md-medium);
		color: var(--c-text-extra-light);
		cursor: pointer;
		text-decoration: underline;
		transition: color var(--time-sm);

		&:hover {
			color: var(--c-text);
		}
	}

	.links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-md);

		a {
			display: inline-flex;
			align-items: center;
			gap: var(--space-xs);
			font: var(--f-ui-sm-medium);
			color: var(--c-text-extra-light);
			text-decoration: none;
			transition: color var(--time-sm);

			&:hover {
				color: var(--c-text);
			}

			:global(svg) {
				width: 1em;
				height: 1em;
			}
		}
	}
</style>
