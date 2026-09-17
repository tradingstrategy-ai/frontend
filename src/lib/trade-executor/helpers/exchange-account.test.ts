import { describe, expect, it } from 'vitest';
import type { OnChainData } from '../schemas/summary';
import type { Portfolio } from '../schemas/portfolio';
import {
	exchangeSupportsPositionStatus,
	getExchangeAccountInfo,
	getExchangeAccountInfoFromPortfolio,
	getExchangeAccountUrl
} from './exchange-account';

const safe = '0x7838A4E4ecD438c1BdD13b014675c7e877b8b490';

const lagoonOnChainData = {
	asset_management_mode: 'lagoon',
	smart_contracts: { safe }
} as unknown as OnChainData;

function exchangePosition(other_data: Record<string, unknown>) {
	return { pair: { kind: 'exchange_account' as const, other_data } };
}

describe('getExchangeAccountUrl', () => {
	it('builds address-keyed URLs for EVM exchanges', () => {
		expect(getExchangeAccountUrl('gmx', { address: safe })).toBe(`https://app.gmx.io/#/accounts/${safe}`);
		expect(getExchangeAccountUrl('derive', { address: safe })).toBe(`https://explorer.derive.xyz/address/${safe}`);
	});

	it('builds account-index-keyed URL for Lighter', () => {
		expect(getExchangeAccountUrl('lighter', { accountId: '748071' })).toBe(
			'https://app.lighter.xyz/explorer/accounts/748071'
		);
	});

	it('returns undefined when the required identifier is missing', () => {
		expect(getExchangeAccountUrl('lighter', { address: safe })).toBeUndefined();
		expect(getExchangeAccountUrl('gmx', { accountId: '1' })).toBeUndefined();
		expect(getExchangeAccountUrl('unknown', { address: safe })).toBeUndefined();
	});
});

describe('getExchangeAccountInfo', () => {
	it('resolves from tags for address-keyed exchanges', () => {
		const strategy = { tags: ['exchange_account_strategy_derive'], on_chain_data: lagoonOnChainData };
		expect(getExchangeAccountInfo(strategy)).toEqual({
			url: `https://explorer.derive.xyz/address/${safe}`,
			name: 'Derive',
			protocol: 'derive'
		});
	});

	it('resolves GMX from position data when tags lack the protocol', () => {
		const strategy = { tags: ['live', 'exchange_account_strategy'], on_chain_data: lagoonOnChainData };
		const positions = [
			{ pair: { kind: 'spot_market_hold' as const, other_data: null } },
			exchangePosition({ exchange_protocol: 'gmx' })
		];
		expect(getExchangeAccountInfo(strategy, positions)?.url).toBe(`https://app.gmx.io/#/accounts/${safe}`);
	});

	it('resolves the Lighter account page from the position account index', () => {
		const strategy = { tags: ['beta', 'exchange_account_strategy'], on_chain_data: lagoonOnChainData };
		const positions = [exchangePosition({ exchange_protocol: 'lighter', exchange_subaccount_id: 748071 })];
		expect(getExchangeAccountInfo(strategy, positions)).toEqual({
			url: 'https://app.lighter.xyz/explorer/accounts/748071',
			name: 'Lighter',
			protocol: 'lighter'
		});
	});

	it('uses the position account index even when tags name the protocol', () => {
		const strategy = { tags: ['exchange_account_strategy_lighter'], on_chain_data: lagoonOnChainData };
		expect(getExchangeAccountInfo(strategy)).toBeUndefined();
		const positions = [exchangePosition({ exchange_protocol: 'lighter', exchange_subaccount_id: 748071 })];
		expect(getExchangeAccountInfo(strategy, positions)?.url).toBe('https://app.lighter.xyz/explorer/accounts/748071');
	});

	it('returns undefined for non-exchange strategies', () => {
		const strategy = { tags: ['live'], on_chain_data: lagoonOnChainData };
		expect(getExchangeAccountInfo(strategy, [])).toBeUndefined();
	});
});

describe('getExchangeAccountInfoFromPortfolio', () => {
	it('inspects open and closed positions', () => {
		const strategy = { tags: [], on_chain_data: lagoonOnChainData };
		const portfolio = {
			open_positions: {},
			closed_positions: { 1: exchangePosition({ exchange_protocol: 'gmx' }) }
		} as unknown as Portfolio;
		expect(getExchangeAccountInfoFromPortfolio(strategy, portfolio)?.protocol).toBe('gmx');
	});
});

describe('exchangeSupportsPositionStatus', () => {
	it('only exposes open positions for Lighter and GMX', () => {
		expect(exchangeSupportsPositionStatus('lighter', 'open')).toBe(true);
		expect(exchangeSupportsPositionStatus('lighter', 'closed')).toBe(false);
		expect(exchangeSupportsPositionStatus('gmx', 'closed')).toBe(false);
		expect(exchangeSupportsPositionStatus('derive', 'closed')).toBe(true);
	});
});
