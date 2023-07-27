





export async function load({ params, parent }) {

	const { summary, state, position, chain } = await parent();



	return {
		summary,
    state,
    position,
    chain
	};
}
