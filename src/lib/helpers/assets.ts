const logos = import.meta.glob('../assets/logos/*.svg', { as: 'url', eager: true });

// returns URL for logo images found in `lib/assets/logos`
export function getLogoUrl(name: string) {
	return logos[`../assets/logos/${name}.svg`];
}

// returns URL for icon images found from `cryptocurrency-icons` npm module
export function getCryptoIconUrl(name: string) {
	return `/node_modules/cryptocurrency-icons/svg/color/${name}.svg`;
}
