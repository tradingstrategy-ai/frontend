import { z } from 'zod';
import { geoBlock } from '$lib/config';
import { error } from '@sveltejs/kit';

export const countryCodeSchema = z.string().regex(/^[A-Z]{2}$/);
export type CountryCode = z.infer<typeof countryCodeSchema>;

export const geoBlockSchema = z.record(countryCodeSchema.array().nullish());
export type GeoBlock = z.infer<typeof geoBlockSchema>;

/**
 * Check if a feature is blocked for a given country
 *
 * @example
 * isGeoBlocked('strategies:view', 'KP')  // true (viewing strategies blocked in North Korea)
 *
 * @param feature - feature name (convention: <domain>:<action>)
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns true if feature is blocked
 */
export function isGeoBlocked(feature: string, countryCode: CountryCode | undefined): boolean {
	const blockedCountries = geoBlock[feature] ?? [];
	const country = countryCode?.toUpperCase() ?? 'N/A';
	return blockedCountries.includes(country);
}

export function getCountryName(countryCode: CountryCode | undefined) {
	const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
	return countryCode ? regionNames.of(countryCode) : 'unknown country';
}

/**
 * Throw an error if a feature is blocked for a given country
 *
 * @param feature - feature name (convention: <domain>:<action>)
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @param isAdmin - optional admin override flag
 * @throws 451 SvelteKit error if the feature is blocked
 */
export function assertNotGeoBlocked(feature: string, countryCode: CountryCode | undefined, isAdmin = false) {
	if (isAdmin) return;
	if (isGeoBlocked(feature, countryCode)) {
		throw error(451, `Unavailable in ${getCountryName(countryCode)}`);
	}
}
