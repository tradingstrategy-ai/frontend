import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
	const { wizard_slug, wizard_step } = params;

	return {
		wizard_slug,
		wizard_step
	};
}) satisfies PageLoad;
