import { type PositionStatus, positionStatus } from 'trade-executor/state/position';

export function match(param): param is PositionStatus {
	return positionStatus.safeParse(param).success;
}
