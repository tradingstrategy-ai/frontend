import { z } from 'zod';

export const announcementSchema = z.object({
	title: z.string().nullish(),
	description: z.string().min(1),
	ctaLabel: z.string().min(1),
	href: z.string(),
	publishedAt: z.union([z.string().date(), z.string().datetime()])
});

export type Announcement = z.infer<typeof announcementSchema>;
