import { z } from 'zod';

const dateStrSchema = z.string().date().or(z.string().datetime());

export const announcementSchema = z.object({
	title: z.string().nullish(),
	description: z.string().min(1),
	ctaLabel: z.string().min(1),
	href: z.string(),
	publishedAt: dateStrSchema.pipe(z.coerce.date())
});

export type Announcement = z.infer<typeof announcementSchema>;
