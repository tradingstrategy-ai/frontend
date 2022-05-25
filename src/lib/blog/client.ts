import { ghostConfig } from '$lib/config';
import GhostContentAPI from '@tryghost/content-api';

export default (({ apiUrl, contentApiKey }) => {
	if (!apiUrl || !contentApiKey) return;

	return new GhostContentAPI({
		url: apiUrl,
		key: contentApiKey,
		version: 'v3'
	});
})(ghostConfig);
