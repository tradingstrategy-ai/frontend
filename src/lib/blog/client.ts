import GhostContentAPI from '@tryghost/content-api';

export default function getGhostClient({ apiUrl, contentApiKey }) {
	if (!apiUrl || !contentApiKey) return {};

	return new GhostContentAPI({
		url: apiUrl,
		key: contentApiKey,
		version: 'v5.12'
	});
}
