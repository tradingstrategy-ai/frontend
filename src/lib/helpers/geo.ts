import { z } from 'zod';

export const countryCodeSchema = z.string().regex(/^[A-Z]{2}$/);
export type CountryCode = z.infer<typeof countryCodeSchema>;

export const geoBlockSchema = z.record(countryCodeSchema.array());
export type GeoBlock = z.infer<typeof geoBlockSchema>;
