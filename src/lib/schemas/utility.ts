import { z } from 'zod';

export const timeBucketEnum = z.enum(['1m', '5m', '15m', '1h', '4h', '1d', '7d', '30d']);
export type TimeBucket = z.infer<typeof timeBucketEnum>;
