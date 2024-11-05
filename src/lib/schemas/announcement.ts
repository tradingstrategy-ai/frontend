import { z } from 'zod';

const dateStrSchema = z.string().date().or(z.string().datetime());
const dateSchema = dateStrSchema.pipe(z.coerce.date());

export const announcementSchema = z.object({
	title: z.string().nullish(),
	description: z.string().min(1),
	ctaLabel: z.string().min(1),
	href: z.string(),
	publishAt: dateSchema,
	expireAt: dateSchema.nullish()
});

export type Announcement = z.infer<typeof announcementSchema>;
