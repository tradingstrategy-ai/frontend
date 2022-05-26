/**
 * Make a URL friendly slug from any text.
 *
 * Taken from https://gist.github.com/codeguy/6684588#gistcomment-3974852
 *
 * @param s Text to slugify
 * @param separator Word separator in the slugs
 */
export function slugify(s: string, separator: string = '-') {
	return s
		.normalize('NFD') // split an accented letter in the base letter and the acent
		.replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
		.toLowerCase()
		.replace(/[^a-z0-9 -]/g, '') // remove all chars not letters, numbers and spaces (to be replaced)
		.trim()
		.replace(/\s+/g, separator);
}
