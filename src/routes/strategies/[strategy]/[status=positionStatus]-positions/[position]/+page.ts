import {extractPositionInfo} from "./position-data";


/** @type {import('./$types').PageLoad} */
export async function load({ params, parent }) {

	const { summary, state, position, chain } = await parent();

  const positionInfo = extractPositionInfo(position);

	return {
		summary,
    state,
    position,
    chain,
    positionInfo
	};
}
