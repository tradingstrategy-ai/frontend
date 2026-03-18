import { metadataLogoKinds } from '$lib/metadata-logo/proxy';

export function match(param: string) {
	return metadataLogoKinds.includes(param as (typeof metadataLogoKinds)[number]);
}
