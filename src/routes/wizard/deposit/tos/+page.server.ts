export async function load() {
	// TODO: these values will come from the terms of service contract
	const version = '1';
	const hash = '748f0d03120ea354d9d8ae50e73cedd316d58635cf131038790d6408413e59d0';
	const fileName = `v${version}-${hash.slice(0, 10)}.txt`;

	let tosText: string | undefined;

	try {
		tosText = (await import(`/src/lib/trade-executor/tos/${fileName}?raw`)).default as string;
	} catch (e) {
		console.error(e);
	}

	return { version, hash, fileName, tosText };
}
