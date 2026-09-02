import type { VaultInfo } from '$lib/top-vaults/schemas';
import { hasInternalisedVaultFees } from '$lib/top-vaults/helpers';

export type FeaturedPerformancePeriodKey = '1M' | '3M' | 'Max';
export type FeaturedPerformanceReturnMode = 'gross' | 'net';

interface ReturnValue {
	annualised: number | null;
	absolute: number | null;
}

export interface FeaturedPerformancePeriod {
	label: '1M' | '3M' | 'Lifetime';
	return: {
		gross: ReturnValue;
		net: ReturnValue;
	};
	startDate: string | null;
	endDate: string | null;
	sharpe: number | null;
	volatility: number | null;
}

export interface ExampleFee {
	rate: number | null;
	amount: number | null;
	internalised: boolean;
}

export interface FeaturedPerformanceExample {
	capitalIn: number;
	capitalInvested: number;
	grossCapitalAtEnd: number | null;
	capitalOut: number | null;
	grossReturn: ReturnValue;
	netReturn: ReturnValue;
	depositFee: ExampleFee;
	performanceFee: ExampleFee;
	managementFee: ExampleFee;
	withdrawalFee: ExampleFee;
	startDate: string | null;
	endDate: string | null;
	daysInvested: number | null;
	hasInternalisedFees: boolean;
}

const DAYS_PER_YEAR = 365.25;

/** Return the selected chart period and its matching gross and net metrics. */
export function getFeaturedPerformancePeriod(
	vault: VaultInfo,
	periodKey: FeaturedPerformancePeriodKey
): FeaturedPerformancePeriod {
	const periodResults = new Map(vault.period_results.map((period) => [period.period.toLowerCase(), period]));

	if (periodKey === '1M') {
		const period = periodResults.get('1m');
		return {
			label: '1M',
			return: {
				gross: {
					annualised: period?.cagr_gross ?? vault.one_month_cagr,
					absolute: period?.returns_gross ?? vault.one_month_returns
				},
				net: {
					annualised: period?.cagr_net ?? vault.one_month_cagr_net,
					absolute: period?.returns_net ?? vault.one_month_returns_net
				}
			},
			startDate: period?.period_start_at ?? vault.one_month_start,
			endDate: period?.period_end_at ?? vault.one_month_end,
			sharpe: period?.sharpe ?? null,
			volatility: period?.volatility ?? null
		};
	}

	if (periodKey === '3M') {
		const period = periodResults.get('3m');
		return {
			label: '3M',
			return: {
				gross: {
					annualised: period?.cagr_gross ?? vault.three_months_cagr,
					absolute: period?.returns_gross ?? vault.three_months_returns
				},
				net: {
					annualised: period?.cagr_net ?? vault.three_months_cagr_net,
					absolute: period?.returns_net ?? vault.three_months_returns_net
				}
			},
			startDate: period?.period_start_at ?? vault.three_months_start,
			endDate: period?.period_end_at ?? vault.three_months_end,
			sharpe: vault.three_months_sharpe,
			volatility: vault.three_months_volatility
		};
	}

	const period = periodResults.get('lifetime');
	return {
		label: 'Lifetime',
		return: {
			gross: {
				annualised: period?.cagr_gross ?? vault.cagr,
				absolute: period?.returns_gross ?? vault.lifetime_return
			},
			net: {
				annualised: period?.cagr_net ?? vault.cagr_net,
				absolute: period?.returns_net ?? vault.lifetime_return_net
			}
		},
		startDate: period?.period_start_at ?? vault.lifetime_start,
		endDate: period?.period_end_at ?? vault.lifetime_end,
		sharpe: period?.sharpe ?? null,
		volatility: period?.volatility ?? null
	};
}

export function getFeaturedPerformanceReturnMode(
	hasNetFeeInformation: boolean,
	netReturn: number | null | undefined
): FeaturedPerformanceReturnMode {
	return hasNetFeeInformation && netReturn != null ? 'net' : 'gross';
}

export function getFeaturedPerformanceReturnLabel(periodLabel: string, mode: FeaturedPerformanceReturnMode): string {
	return `${periodLabel} ann. ${mode} returns`;
}

/** Return elapsed calendar days, or null when the period dates are unusable. */
export function getDaysInvested(
	startDate: string | null | undefined,
	endDate: string | null | undefined
): number | null {
	if (startDate == null || endDate == null) return null;

	const start = new Date(startDate);
	const end = new Date(endDate);
	if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) return null;

	return Math.max(1, Math.round((end.getTime() - start.getTime()) / 86_400_000));
}

/** Convert an annualised return to its period return only when raw data is unavailable. */
export function getAbsolutePeriodReturn(
	absoluteReturn: number | null | undefined,
	annualisedReturn: number | null | undefined,
	daysInvested: number | null | undefined
): number | null {
	if (absoluteReturn != null) return absoluteReturn;
	if (annualisedReturn == null || daysInvested == null) return null;

	return (1 + annualisedReturn) ** (daysInvested / DAYS_PER_YEAR) - 1;
}

function isInternalisedFee(vault: VaultInfo, fee: 'management' | 'performance'): boolean {
	return hasInternalisedVaultFees(vault) && (vault.gross_fees?.[fee] ?? 0) > 0;
}

function createFee(rate: number | null | undefined, amount: number | null, internalised = false): ExampleFee {
	return { rate: rate ?? null, amount, internalised };
}

/**
 * Build a reconciled $10,000-style return example from backend period metrics.
 *
 * Internalised management and performance fees are disclosures only because
 * they are already reflected in the share-price return. Transaction fees and
 * externalised fees are applied in backend order: deposit, management,
 * performance, then withdrawal.
 */
export function getFeaturedPerformanceExample(
	vault: VaultInfo,
	period: FeaturedPerformancePeriod,
	capitalIn: number
): FeaturedPerformanceExample {
	const daysInvested = getDaysInvested(period.startDate, period.endDate);
	const grossAbsoluteReturn = getAbsolutePeriodReturn(
		period.return.gross.absolute,
		period.return.gross.annualised,
		daysInvested
	);
	const netAbsoluteReturn = getAbsolutePeriodReturn(
		period.return.net.absolute,
		period.return.net.annualised,
		daysInvested
	);
	const depositRate = vault.net_fees?.deposit ?? null;
	const depositAmount = depositRate == null ? null : capitalIn * depositRate;
	const capitalInvested = capitalIn - (depositAmount ?? 0);
	const grossCapitalAtEnd = grossAbsoluteReturn == null ? null : capitalInvested * (1 + grossAbsoluteReturn);
	const managementInternalised = isInternalisedFee(vault, 'management');
	const performanceInternalised = isInternalisedFee(vault, 'performance');
	const managementRate = managementInternalised
		? (vault.gross_fees?.management ?? null)
		: (vault.net_fees?.management ?? null);
	const managementAmount =
		managementInternalised || managementRate == null || daysInvested == null
			? null
			: capitalInvested * managementRate * (daysInvested / DAYS_PER_YEAR);
	const performanceRate = performanceInternalised
		? (vault.gross_fees?.performance ?? null)
		: (vault.net_fees?.performance ?? null);
	const performanceAmount =
		performanceInternalised || performanceRate == null || grossAbsoluteReturn == null || managementAmount == null
			? null
			: Math.max(0, capitalInvested * grossAbsoluteReturn - managementAmount) * performanceRate;
	const capitalOut = netAbsoluteReturn == null ? null : capitalIn * (1 + netAbsoluteReturn);
	const withdrawalRate = vault.net_fees?.withdraw ?? null;
	const withdrawalAmount =
		capitalOut == null || withdrawalRate == null || withdrawalRate >= 1
			? null
			: (capitalOut * withdrawalRate) / (1 - withdrawalRate);

	return {
		capitalIn,
		capitalInvested,
		grossCapitalAtEnd,
		capitalOut,
		grossReturn: { ...period.return.gross, absolute: grossAbsoluteReturn },
		netReturn: { ...period.return.net, absolute: netAbsoluteReturn },
		depositFee: createFee(depositRate, depositAmount),
		performanceFee: createFee(performanceRate, performanceAmount, performanceInternalised),
		managementFee: createFee(managementRate, managementAmount, managementInternalised),
		withdrawalFee: createFee(withdrawalRate, withdrawalAmount),
		startDate: period.startDate,
		endDate: period.endDate,
		daysInvested,
		hasInternalisedFees: hasInternalisedVaultFees(vault)
	};
}
