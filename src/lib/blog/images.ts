import { ghostConfig } from '$lib/config';

type BlogImageFormat = 'original' | 'webp';

type BlogImageOptions = {
	width?: number;
	height?: number;
	quality?: number;
	format?: BlogImageFormat;
	version?: string | number | Date | null;
};

export function getBlogImageUrl(imageUrl: string, options: BlogImageOptions = {}) {
	const { apiUrl } = ghostConfig;
	if (!apiUrl || !imageUrl.startsWith(apiUrl)) return imageUrl;

	const path = imageUrl.slice(apiUrl.length).replace(/^\/+/, '');
	const params = new URLSearchParams();

	if (options.width) params.set('w', `${options.width}`);
	if (options.height) params.set('h', `${options.height}`);
	if (options.quality) params.set('q', `${options.quality}`);
	if (options.format && options.format !== 'original') params.set('format', options.format);

	const version =
		options.version instanceof Date
			? options.version.toISOString()
			: options.version != null
				? `${options.version}`
				: null;
	if (version) params.set('v', version);

	const query = params.toString();
	return `/blog/image/${path}${query ? `?${query}` : ''}`;
}
