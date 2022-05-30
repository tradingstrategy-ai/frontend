/**
 * Return appropriate { status, error } object for chain entity API errors
 */
export default function (response, type: string, chainParams: string[]) {
	let message: string;

	if (response.status === 404) {
		const resource = chainParams.join('/');
		message = `${type} not found: ${resource}`;
	} else {
		message = `${response.statusText}; could not load data for URL: ${response.url}`;
	}

	return {
		status: response.status,
		error: new Error(message)
	};
}
