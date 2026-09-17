/**
 * Search-result title and description for strategy overview pages.
 *
 * The 130 `/strategies/<id>` pages rank around position 10 but had a 0.15 % click-through
 * rate with `<name> | Trading Strategy` titles that do not say what the page is. The title
 * states the page type and chain, and the description leads with the live return and TVL
 * when both are known. See docs/google-webmasters.md.
 */

import { formatDollar, formatPercent, isNumber } from '$lib/helpers/formatters';
import { DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH, truncateAtWord } from '$lib/helpers/seo';

export type StrategyPageMetaInput = {
	name: string;
	shortDescription?: string | null;
	chainName?: string | null;
	/** Annualised net return as a decimal (0.12 = 12 %) */
	annualReturn?: MaybeNumber;
	/** Current assets under management in USD */
	tvlUsd?: MaybeNumber;
};

export type StrategyPageMeta = {
	title: string;
	description: string;
};

/**
 * Build the strategy page `<title>` and meta description.
 *
 * The title tries the most descriptive form first and drops detail until it fits in
 * `TITLE_MAX_LENGTH`. The description only quotes the return and TVL when both are known
 * and positive; otherwise it falls back to the strategy's own short description.
 *
 * @param input strategy name, description and optional chain / live metrics
 */
export function getStrategyPageMeta({
	name,
	shortDescription,
	chainName,
	annualReturn,
	tvlUsd
}: StrategyPageMetaInput): StrategyPageMeta {
	const chain = chainName?.trim();

	const titleCandidates = [
		chain && `${name} — automated DeFi vault on ${chain} | Trading Strategy`,
		chain && `${name} — DeFi vault on ${chain} | Trading Strategy`,
		`${name} — DeFi vault | Trading Strategy`,
		`${name} | Trading Strategy`
	].filter((candidate): candidate is string => Boolean(candidate));

	const title = titleCandidates.find((candidate) => candidate.length <= TITLE_MAX_LENGTH) ?? titleCandidates.at(-1)!;

	const hasMetrics = isNumber(annualReturn) && annualReturn > 0 && isNumber(tvlUsd) && tvlUsd > 0;
	const vaultSentence = chain ? `Automated DeFi trading vault on ${chain}.` : 'Automated DeFi trading vault.';

	const summary = shortDescription?.trim() ?? '';
	const description = hasMetrics
		? `${name}: ${formatPercent(annualReturn, 1)} annualised return, ${formatDollar(tvlUsd, 1, 1)} TVL. ${vaultSentence} ${summary}`
		: `${summary} ${vaultSentence}`;

	return { title, description: truncateAtWord(description.trim(), DESCRIPTION_MAX_LENGTH) };
}
