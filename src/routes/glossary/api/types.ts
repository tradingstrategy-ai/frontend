export interface GlossaryEntry {
  html: string;
  name: string;
}

// Slug -> glossary entry mappings
export type GlossaryMap = Record<string, GlossaryEntry>;

