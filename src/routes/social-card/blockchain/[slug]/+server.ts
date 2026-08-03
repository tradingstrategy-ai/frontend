import { getChain } from '$lib/helpers/chain';
import { renderSocialCard, socialCardResponse } from '$lib/social-card/render';
import { error } from '@sveltejs/kit';

/** Render a local blockchain logo on a platform-safe PNG canvas. */
export async function GET({ params }) {
	const chain = getChain(params.slug);
	if (!chain) error(404, 'Blockchain logo not found');

	let logo: string;
	try {
		logo = (await import(`$lib/assets/logos/blockchains/${chain.slug}.svg?raw`)).default;
	} catch {
		error(404, 'Blockchain logo not found');
	}

	return socialCardResponse(await renderSocialCard(logo, { width: 420, height: 420 }));
}
