/**
 * Return appropriate error object for chain entity API errors
 */
import { error } from '@sveltejs/kit';

export default async function (response: Response) {
	if (response.status === 404) {
		return error(response.status, {
			message: response.statusText,
			stack: `Server resource not found: ${response.url}`
		});
	}

	const stack: string[] = [];
	stack.push(`Error loading data from URL: ${response.url}`);
	stack.push(`${response.status} ${response.statusText}`);
	stack.push(await response.text());

	return error(503, {
		message: response.statusText,
		stack: stack.join('\n')
	});
}
