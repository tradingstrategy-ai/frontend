import { error } from '@sveltejs/kit';

export async function load() {
	error(400, 'Wizard not properly initialized');
}
