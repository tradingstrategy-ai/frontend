const logos = import.meta.glob('../assets/logos/*.svg', { as: 'url', eager: true });
const blockchainsLogos = import.meta.glob('../assets/logos/blockchains/*.svg', { as: 'url', eager: true });
const dexesLogos = import.meta.glob('../assets/logos/dexes/*.svg', { as: 'url', eager: true });
const tokensLogos = import.meta.glob('../assets/logos/tokens/*.svg', { as: 'url', eager: true });
const cryptoIcons = import.meta.glob('/node_modules/cryptocurrency-icons/svg/color/*.svg', { as: 'url', eager: true });

// returns URL for logo images found in `lib/assets/logos`
export function getLogoUrl(name: string) {
	return logos[`../assets/logos/${name}.svg`];
}

// returns URL for logo images found in `lib/assets/logos/blockchains`
export function getBlockchainLogoUrl(name: string) {
	return blockchainsLogos[`../assets/logos/blockchains/${name}.svg`];
}

// returns URL for logo images found in `lib/assets/logos/dexes`
export function getDEXLogoUrl(name: string) {
	return dexesLogos[`../assets/logos/dexes/${name}.svg`];
}

// returns URL for icon images found from `cryptocurrency-icons` npm module
export function getCryptoIconUrl(name: string) {
	return cryptoIcons[`/node_modules/cryptocurrency-icons/svg/color/${name}.svg`];
}

// returns URL for logo images found in `lib/assets/logos/tokens`
export function getTokenLogoUrl(name: string) {
	return tokensLogos[`../assets/logos/tokens/${name}.svg`];
}
