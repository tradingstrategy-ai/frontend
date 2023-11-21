import type { PositionKind } from 'trade-executor/state/interface';

export function match(param): param is PositionKind {
	return ['open', 'closed', 'frozen'].includes(param);
}
