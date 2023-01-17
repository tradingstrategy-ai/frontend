const logos = import.meta.glob('../assets/logos/*.svg', { as: 'url', eager: true });

export function getLogoUrl(name: string) {
	return logos[`../assets/logos/${name}.svg`];
}
