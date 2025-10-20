import { z } from 'zod';

export const timeBucketEnum = z.enum(['1m', '5m', '15m', '1h', '4h', '1d', '7d', '30d']);
export type TimeBucket = z.infer<typeof timeBucketEnum>;

export const colorModeEnum = z.enum(['light', 'dark', 'system']);
export type ColorMode = z.infer<typeof colorModeEnum>;

export const isoDateTime = z.iso.datetime({ local: true, offset: true });
export type ISODateTime = z.infer<typeof isoDateTime>;
