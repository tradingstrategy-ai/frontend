<!-- Render one glossary term

- Uses Google FAQ page JSON-LD https://developers.google.com/search/docs/appearance/structured-data/faqpage

- How to generate application/ld+json in Svelte https://stackoverflow.com/a/59809388/315168

-->
<script lang="ts">
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import type { GlossaryEntry } from '../glossary';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Section } from '$lib/components';
	import { serializeSchema } from '$lib/helpers/google-meta';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';
	import { getRelatedVaultLinks } from '../related-vault-links';

	let { data } = $props();
	let { entry } = $derived(data);
	let relatedVaultLinks = $derived(getRelatedVaultLinks(entry.slug));

	/**
	 * Generate LD JSON markup
	 *
	 * https://developers.google.com/search/docs/appearance/structured-data/faqpage
	 */
	function getGoogleFAQPageSchema({ name, html }: GlossaryEntry): object {
		const jsonData = {
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: [
				{
					'@type': 'Question',
					name: `What is ${name}?`,
					acceptedAnswer: {
						'@type': 'Answer',
						text: html
					}
				}
			]
		};
		return jsonData;
	}
</script>

<MetaTags titleParts={[`What is ${entry.name}?`, 'DeFi and trading glossary']} description={entry.description} />

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD serialised from the glossary entry -->
	{@html serializeSchema(getGoogleFAQPageSchema(entry))}
</svelte:head>

<main>
	<Breadcrumbs labels={{ [entry.slug]: entry.name }} />

	<Section tag="article" padding="sm" gap="sm">
		<h1 data-testid="glossary-heading">What Is {entry.name}?</h1>
		<div class="answer">
			<!-- eslint-disable-next-line svelte/no-at-html-tags -- glossary definition HTML scraped from the documentation site -->
			{@html entry.html}
		</div>
		{#if relatedVaultLinks.length}
			<nav class="related-vaults" aria-label="Vault data">
				<h2>Vault data</h2>
				<ul>
					{#each relatedVaultLinks as link (link.href)}
						<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- static internal vault paths -->
						<li><a href={link.href}>{link.label}</a></li>
					{/each}
				</ul>
			</nav>
		{/if}
	</Section>

	<Section padding="sm">
		<NewsletterOptInBanner />
	</Section>
</main>

<style>
	h1 {
		font: var(--f-h1-medium);
		text-transform: capitalize;
	}

	.related-vaults {
		display: grid;
		gap: var(--space-sm);

		h2 {
			font: var(--f-heading-sm-medium);
		}

		ul {
			display: flex;
			flex-wrap: wrap;
			gap: var(--space-sm) var(--space-lg);
			margin: 0;
			padding: 0;
			list-style: none;
		}

		a {
			font: var(--f-ui-lg-medium);
			text-decoration: underline;
		}
	}

	.answer {
		display: grid;
		gap: var(--space-lg);
		font: var(--f-ui-lg-roman);
		letter-spacing: var(--f-ui-lg-spacing, normal);

		/* Format tags in HTML output */
		:global(a) {
			font-weight: 700;
			text-decoration: underline;
		}

		:global(p) {
			margin-bottom: 0.5rem;
		}
	}
</style>
