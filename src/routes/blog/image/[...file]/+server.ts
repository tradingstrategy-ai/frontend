/**
 * A hack to get Twitter to share images from the private blog.
 */
import type { RequestHandler } from './$types';
import { ghostConfig } from '$lib/config';

export const GET: RequestHandler = ({ params }) => {
	return fetch(`${ghostConfig.apiUrl}/${params.file}`);
};
