/**
 * Describe our glossary entries.
 */
export interface GlossaryEntry {
	/** Glossary explanation HTML. Contains <p> tags */
	html: string;

	/** Glossary term name */
	name: string;

	/** Glossary URL slug */
	slug: string;

	/** First sentence of the answer */
	shortDescription: string;

}

// Slug -> glossary entry mappings
export type GlossaryMap = Record<string, GlossaryEntry>;
