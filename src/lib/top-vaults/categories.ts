/**
 * Category URL and membership helpers for the top-vaults dataset.
 *
 * The producer stores strategy tags with underscores, while public routes use
 * dash-separated slugs. Keep the conversion in one place so routes never
 * compare a public URL slug directly against a source tag.
 */
import type { VaultCategory, VaultInfo } from './schemas';

const HIDDEN_VAULT_CATEGORY_TAGS = new Set(['unknown']);

export interface VaultCategoryLink {
	slug: string;
	label: string;
}

/** Convert a source tag such as `directional_trading` to a public URL slug. */
export function getVaultCategorySlug(tag: string): string {
	return tag.replaceAll('_', '-');
}

/** Convert a public URL slug such as `directional-trading` to a source tag. */
export function getVaultCategoryTag(slug: string): string {
	return slug.replaceAll('-', '_');
}

/** Return whether a source category should be exposed in public vault pages. */
export function isVisibleVaultCategory(tag: string): boolean {
	return !HIDDEN_VAULT_CATEGORY_TAGS.has(tag);
}

/** Return the registered categories for one vault in stable display order. */
export function getVaultCategoryLinks(
	vault: Pick<VaultInfo, 'strategy_tags'>,
	categories: Record<string, VaultCategory>
): VaultCategoryLink[] {
	return [...new Set(vault.strategy_tags ?? [])]
		.flatMap((tag) => {
			if (!isVisibleVaultCategory(tag)) return [];
			const category = Object.hasOwn(categories, tag) ? categories[tag] : undefined;
			return category ? [{ slug: getVaultCategorySlug(tag), label: category.label }] : [];
		})
		.toSorted((a, b) => a.label.localeCompare(b.label));
}
