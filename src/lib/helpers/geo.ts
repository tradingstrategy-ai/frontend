import { z } from 'zod';
import { geoBlock } from '$lib/config';

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

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

export function getCountryName(countryCode: CountryCode | undefined) {
	return countryCode ? regionNames.of(countryCode) : 'unknown country';
}
