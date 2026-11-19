export const logoTypes = ['blockchain', 'exchange', 'partner', 'token', 'wallet'] as const;
export type LogoType = (typeof logoTypes)[number];

// returns URL for logo image found in `lib/assets/logos/**/*.svg`
// and served from `/logos` server endpoint; the `.svg` extension lets Cloudflare cache it
export function getLogoUrl(type: LogoType, name: MaybeString) {
	return name ? `/logos/${type}s/${name.toLowerCase()}.svg` : undefined;
}
