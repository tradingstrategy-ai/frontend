const protocols = {
	aave_v3: 'Aave v3'
};

export function getProtocolName(slug: string) {
	// @ts-ignore
	return protocols[slug] ?? slug;
}
