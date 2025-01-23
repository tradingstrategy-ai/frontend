/**
 * StrategyInfo types and factory
 *
 * StrategyInfo is a discriminated union, based on the `connected` boolean.
 *
 * A ConnectedStrategyInfo (connected=true) includes all attributes of
 * StrategyConfiguration and the StrategySummary.
 *
 * A DisconnectedStrategyInfo (connected=false) includes StrategyConfiguration attributes,
 * a subset of StrategySummary attributes, and an error attribute to indicate why it failed
 * to load or parse.
 *
 */
import { type StrategyConfiguration } from '../schemas/configuration';
import { type StrategySummary } from '../schemas/summary';
import loadError from '../assets/load-error.jpg';

export type ConnectedStrategyInfo = StrategyConfiguration &
	StrategySummary & {
		connected: true;
	};

export type DisconnectedStrategyInfo = StrategyConfiguration &
	Partial<StrategySummary> & {
		connected: false;
		icon_url: string;
		error: string;
		sort_priority: number;
	};

export type StrategyInfo = ConnectedStrategyInfo | DisconnectedStrategyInfo;

export function createConnectedStrategyInfo(
	strategyConf: StrategyConfiguration,
	strategySummary: StrategySummary
): ConnectedStrategyInfo {
	return {
		connected: true,
		...strategyConf,
		...strategySummary
	};
}

export function createDisconnectedStrategyInfo(
	strategyConf: StrategyConfiguration,
	error: any
): DisconnectedStrategyInfo {
	return {
		...strategyConf,
		connected: false,
		icon_url: loadError,
		error: error.message ?? String(error),
		sort_priority: -1
	};
}
