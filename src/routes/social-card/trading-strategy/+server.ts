import logo from '$lib/assets/logo-horizontal.svg?raw';
import { renderSocialCard, socialCardResponse } from '$lib/social-card/render';

/** Render a platform-safe Trading Strategy fallback card as a large PNG. */
export async function GET() {
	return socialCardResponse(await renderSocialCard(logo, { width: 900, height: 300 }));
}
