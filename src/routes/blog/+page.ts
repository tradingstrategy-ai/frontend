import type { PageLoad } from './$types';
import fetchPosts from './fetchPosts';

export const load: PageLoad = () => fetchPosts();
