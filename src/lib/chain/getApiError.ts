/**
 * Return appropriate error object for chain entity API errors
 */
import { error } from '@sveltejs/kit';

export default function (response: Response, type: string, chainParams: string[]) {
	let message: string;

	if (response.status === 404) {
		const resource = chainParams.join('/');
		message = `${type} not found: ${resource}`;
	} else {
		message = `${response.statusText}; could not load data for URL: ${response.url}`;
	}

	return error(response.status, message);
}
